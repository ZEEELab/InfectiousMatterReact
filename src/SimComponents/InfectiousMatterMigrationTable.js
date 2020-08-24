import React, {useState, useEffect, useLayoutEffect} from 'react';
import MaterialTable from 'material-table';
import { InfectiousMatter } from '../InfectiousMatter/simulation';


const InfectiousMatterMigrationTable = ({InfectiousMatterRef, InfectiousMatterAPI, redraw_trigger}) => {
    const [locations, setLocations] = useState([]);
    const [locationIdMap, setlocationIdMap] = useState({});

    const [columns, setColumns] = useState([
        {field:"from_uuid", hidden:true},
        {field:"to_uuid", hidden:true},
        {title:"From Location", field:"from_idx"},
        {title:"To Location", field:"to_idx"},
        {title:"Visitors/Day", field:"num_agents"}
    ]);

    const [migrationLinks, setMigrationLinks] = useState([]);


    const update_migration_links = function(new_link_data, old_link_data) {
        //setMigrationLinks(new_links);
        console.dir(new_link_data);
        let new_migration_links = [...migrationLinks];
        let update_idx = migrationLinks.findIndex( (entry) => {
            return (
                entry.to_uuid == old_link_data.to_uuid &&
                entry.from_uuid == old_link_data.from_uuid
            )
        });
        new_migration_links[update_idx] = new_link_data;
        console.dir(new_migration_links);
        setMigrationLinks(new_migration_links);
    }

    useEffect( () => {
        console.log('should update api');
    }, [migrationLinks])

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
    }, [])

    useEffect( () => {
        let location_map = {}
        locations.forEach((loc) => {
            location_map[loc.location_uuid] = loc.location_idx;
        });

        setlocationIdMap(location_map);

        let raw_migration_links = InfectiousMatterAPI(InfectiousMatterRef, {type:'get_migration_links'});
        let adjusted_links = raw_migration_links.map((migration_link) => {
            return {
                ...migration_link, 
                from_idx: location_map[migration_link.from_uuid], 
                to_idx: location_map[migration_link.to_uuid]
            }
        })

        setMigrationLinks(adjusted_links);

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
