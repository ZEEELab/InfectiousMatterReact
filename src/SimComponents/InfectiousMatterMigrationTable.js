import React, {useState, useEffect, useLayoutEffect} from 'react';
import MaterialTable from 'material-table';
import { InfectiousMatter } from '../InfectiousMatter/simulation';

function swap(json){
    var ret = {};
    for(var key in json){
      ret[json[key]] = key;
    }
    return ret;
  }

const InfectiousMatterMigrationTable = ({InfectiousMatterRef, InfectiousMatterAPI, worldReadyTrigger}) => {
    const [locations, setLocations] = useState([]);
    const [locationIdMap, setlocationIdMap] = useState({});
    const [lastLocationIdMap, setLastLocationIdMap] = useState(null);

    const [migrationRevision, setMigrationRevision] = useState(0);
    const [migrationLinks, setMigrationLinks] = useState([]);

    const [columns, setColumns] = useState([
        {title:"From Location", field:"from_uuid", type: "numeric"},
        {title:"To Location", field:"to_uuid", type: "numeric"},
        {title:"Visitors/Day", field:"num_agents", type: "numeric"}
    ]);


    const link_diff = (new_link, old_link) => {
        return (
            new_link.to_uuid != old_link.to_uuid ||
            new_link.from_uuid != old_link.from_uuid ||
            new_link.num_agents != old_link.num_agents
            )
    }
    const add_migration_link = function(new_link_data) {
        let existing_link = migrationLinks.find( (element) => {
            return (element.to_uuid == new_link_data.to_uuid && element.from_uuid == new_link_data.from_uuid)
        });

        if (existing_link || new_link_data.num_agents < 0) {
            return false;
        }
        setMigrationLinks([...migrationLinks, new_link_data]);
        setMigrationRevision(c => c+1);

        return true;
    }  

    const update_migration_links = function(new_link_data, old_link_data) {
        //setMigrationLinks(new_links);
        let new_migration_links = [...migrationLinks];
        let update_idx = migrationLinks.findIndex( (entry) => {
            return (
                entry.to_uuid == old_link_data.to_uuid &&
                entry.from_uuid == old_link_data.from_uuid
            )
        });
        if (link_diff(new_link_data, old_link_data)){
            new_migration_links[update_idx] = new_link_data;
            setMigrationLinks(new_migration_links);
            setMigrationRevision(c => c+1);
        }
    }

    const remove_migration_link = function(link_to_remove) {
        let new_migration_links = migrationLinks.filter( (migration_link) => {
            return link_diff(link_to_remove, migration_link)
        })
        setMigrationLinks(new_migration_links);
        
        //we have to remove links ourselves...
        InfectiousMatterAPI(
            InfectiousMatterRef,
            {
                type:'remove_migration_link',
                payload: {
                    from_location: link_to_remove.from_uuid,
                    to_location: link_to_remove.to_uuid
                }
            }
        );

        setMigrationRevision(c => c+1);
    }
 
    useEffect( () => {        
        setColumns([
            {title:"From Location", field:"from_uuid", type: "numeric", lookup:locationIdMap, editable:"onAdd"},
            {title:"To Location", field:"to_uuid", type: "numeric", lookup:locationIdMap, editable:"onAdd"},
            {title:"Visitors/Day", field:"num_agents", type: "numeric"},
        ]);
    }, [locationIdMap]) 
    
    useEffect( () => {
        //don't run the first time when we don't have the migration list yet
        if(migrationLinks.length > 0){
            migrationLinks.forEach( (migration_link) => {
                InfectiousMatterAPI(
                    InfectiousMatterRef,
                    {
                        type:'add_migration_link', 
                        payload:{
                            from_location: migration_link.from_uuid, 
                            to_location: migration_link.to_uuid,
                            num_agents: migration_link.num_agents
                        }
                    });
            })
        }
    }, [migrationRevision])

    useEffect( () => {
        let last_location_id_map = {...locationIdMap}
        let location_list = InfectiousMatterAPI(InfectiousMatterRef, {
            type:'map_locations', 
            payload:{
                callback: (loc, loc_idx) => {
                    return {location_idx:loc_idx, location_uuid:loc.uuid};
                }
            }
        });
        setLocations(location_list);
        let new_migration_links = InfectiousMatterAPI(InfectiousMatterRef, {type:'get_migration_links'});

        if(migrationLinks.length > 0 && last_location_id_map)  {
            InfectiousMatterAPI(InfectiousMatterRef, {type: 'clear_migration_links'});
            new_migration_links = migrationLinks.map( (migration_link) => {
                let new_from_idx = last_location_id_map[migration_link.from_uuid];
                let new_to_idx = last_location_id_map[migration_link.to_uuid];
                return ( {
                    from_uuid: location_list[new_from_idx].location_uuid, 
                    to_uuid: location_list[new_to_idx].location_uuid,
                    num_agents: migration_link.num_agents
                });
            });
        }
        setMigrationLinks(new_migration_links);

        setMigrationRevision(c => c+1);

    }, [worldReadyTrigger])

    useEffect( () => {
        let location_map = {}
        locations.forEach((loc) => {
            location_map[loc.location_uuid] = loc.location_idx;
        });

        setColumns([
            {title:"From Location", field:"from_uuid", type: "numeric", lookup:locationIdMap, editable:"onAdd"},
            {title:"To Location", field:"to_uuid", type: "numeric", lookup:location_map, editable:"onAdd"},
            {title:"Visitors/Day", field:"num_agents", type: "numeric"},
        ]);

        setlocationIdMap(location_map);

    }, [locations]);

    return (
      <MaterialTable 
        title={"Migration Links"}
        columns={columns}
        data={migrationLinks}
        options={{
            filtering: false,
            toolbar: true,
            search: false,
            pageSizeOptions: [5]
        }}
        editable={ { 
            onRowAdd: (new_data) => {
                return new Promise ( (resolve, reject) => {
                    let add_success = add_migration_link(new_data);
                    resolve();
                });
            }, 
            onRowUpdate: (new_data, old_data) => {
                return new Promise( (resolve, reject) => {
                    update_migration_links(new_data, old_data);
                    resolve();
                });
            }, 
            onRowDelete: (old_data) => {
                return new Promise( (resolve, reject) => {
                    remove_migration_link(old_data);
                    resolve();
                })
            }
        }}
      />
    );
  };
  
  export default InfectiousMatterMigrationTable;
