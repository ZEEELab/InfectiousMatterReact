import React, {useState, useEffect, useLayoutEffect} from 'react';
import MaterialTable from 'material-table';
import { InfectiousMatter } from '../InfectiousMatter/simulation';


const InfectiousMatterMigrationTable = ({InfectiousMatterRef, InfectiousMatterAPI, worldReadyTrigger}) => {
    const [locations, setLocations] = useState([]);
    const [locationIdMap, setlocationIdMap] = useState({});
    const [migrationRevision, setMigrationRevision] = useState(0);

    const [columns, setColumns] = useState([
        {title:"From Location", field:"from_uuid", type: "numeric"},
        {title:"To Location", field:"to_uuid", type: "numeric"},
        {title:"Visitors/Day", field:"num_agents", type: "numeric"}
    ]);

    const [migrationLinks, setMigrationLinks] = useState([]);

    const link_diff = (new_link, old_link) => {
        return (
            new_link.to_uuid != old_link.to_uuid ||
            new_link.from_uuid != old_link.from_uuid ||
            new_link.num_agents != old_link.num_agents
            )
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
            console.dir(new_migration_links);
            setMigrationLinks(new_migration_links);
            setMigrationRevision(c => c+1);
        }
    }

    useEffect( () => {
        setColumns([
            {title:"From Location", field:"from_uuid", type: "numeric", lookup:locationIdMap},
            {title:"To Location", field:"to_uuid", type: "numeric", lookup:locationIdMap},
            {title:"Visitors/Day", field:"num_agents", type: "numeric"},
        ]);
    }, [locationIdMap]) 
    
    useEffect( () => {
        //don't run the first time when we don't have the migration list yet
        if(migrationLinks.length > 0){
            console.log('gotta update migration!')
            migrationLinks.forEach( (migration_link) => {
                console.dir(migration_link);

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
        let location_list = InfectiousMatterAPI(InfectiousMatterRef, {
            type:'map_locations', 
            payload:{
                callback: (loc, loc_idx) => {
                    return {location_idx:loc_idx, location_uuid:loc.uuid, location_obj:loc};
                }
            }
        });
        setLocations(location_list);
        let raw_migration_links = InfectiousMatterAPI(InfectiousMatterRef, {type:'get_migration_links'});
        setMigrationLinks(raw_migration_links);

    }, [worldReadyTrigger])

    useEffect( () => {
        let location_map = {}
        locations.forEach((loc) => {
            location_map[loc.location_uuid] = loc.location_idx;
        });

        setlocationIdMap(location_map);

    }, [locations]);

    return (
      <MaterialTable 
        columns={columns}
        data={migrationLinks}
        editable={ { 
            onRowAdd: {}, 
            onRowUpdate: (new_data, old_data) => {
                return new Promise( (resolve, reject) => {
                    update_migration_links(new_data, old_data);
                    resolve();
                });
            }, 
            onRowDelete: {}
            }}
      />
    );
  };
  
  export default InfectiousMatterMigrationTable;
