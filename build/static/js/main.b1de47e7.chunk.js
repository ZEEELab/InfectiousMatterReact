(this.webpackJsonpinfectious_matter_component=this.webpackJsonpinfectious_matter_component||[]).push([[0],{143:function(e,t,n){var a={name:"matter-collision-events",version:"0.1.5",for:"matter-js@^0.12.0",install:function(e){var t=e.Body.create;e.Body.create=function(){var e=t.apply(null,arguments);return e.onCollide=function(t){e._mceOC=t},e.onCollideEnd=function(t){e._mceOCE=t},e.onCollideActive=function(t){e._mceOCA=t},e},e.after("Engine.create",(function(){e.Events.on(this,"collisionStart",(function(t){t.pairs.map((function(t){e.Events.trigger(t.bodyA,"onCollide",{pair:t}),e.Events.trigger(t.bodyB,"onCollide",{pair:t}),t.bodyA._mceOC&&t.bodyA._mceOC(t),t.bodyB._mceOC&&t.bodyB._mceOC(t)}))})),e.Events.on(this,"collisionActive",(function(t){t.pairs.map((function(t){e.Events.trigger(t.bodyA,"onCollideActive",{pair:t}),e.Events.trigger(t.bodyB,"onCollideActive",{pair:t}),t.bodyA._mceOCA&&t.bodyA._mceOCA(t),t.bodyB._mceOCA&&t.bodyB._mceOCA(t)}))})),e.Events.on(this,"collisionEnd",(function(t){t.pairs.map((function(t){e.Events.trigger(t.bodyA,"onCollideEnd",{pair:t}),e.Events.trigger(t.bodyB,"onCollideEnd",{pair:t}),t.bodyA._mceOCE&&t.bodyA._mceOCE(t),t.bodyB._mceOCE&&t.bodyB._mceOCE(t)}))}))}))}};n(15).Plugin.register(a),e.exports.MatterCollisionEvents=a},147:function(e,t,n){var a=n(48);function i(e,t){return Math.random()*(t-e)+e}function o(e){this.name=e,this.uuid=a(),this.bounds=void 0,this.props={},this.friction=.02,this.occupants=[],this.border_color=void 0}o.prototype.draw_borders=function(e,t){t=t&&this.border_color?t||this.border_color:"black";var n=this.bounds.max.x-this.bounds.min.x,a=this.bounds.max.y-this.bounds.min.y;e.beginPath(),e.rect(this.bounds.min.x-2,this.bounds.min.y-2,n+4,a+4),e.strokeStyle=t,e.lineWidth=2,e.stroke()},o.prototype.get_random_position=function(){return this.bounds?{x:i(this.bounds.min.x,this.bounds.max.x),y:i(this.bounds.min.y,this.bounds.max.y)}:{x:0,y:0}},o.prototype.remove_agent=function(e){this.occupants=this.occupants.filter((function(t){return t!==e})),e.location=void 0},o.prototype.set_bounds=function(e){this.bounds=e},o.prototype.migrate_to=function(e,t,n){this.remove_agent(t),e.add_agent(t),n&&n(t)},o.prototype.try_getting_random_residents=function(e){for(var t,n=[],a=0;a<e;a++){var i=(t=this.occupants)[Math.floor(t.length*Math.random())];i&&0==i.migrating&&n.push(i)}return n},o.prototype.add_agent=function(e){this.occupants.push(e),e.location=this},e.exports=o},148:function(e,t){function n(){this.members=[]}n.prototype.move_cohort=function(e,t){for(var n=0;n<this.members.length;n++){var a=this.members[n];a.location.migrate_to(e,a,t)}},n.prototype.send_cohort_home=function(e){for(var t=0;t<this.members.length;t++){var n=this.members[t];n.location.migrate_to(n.home,n,e)}},n.prototype.add_agent=function(e,t){this.members.push(e),e.cohorts.push(this),t&&t(e)},e.exports=n},149:function(e,t,n){var a=n(150),i=n(82);function o(){this.fast_queue=new a((function(e,t){return e.time<t.time}))}o.prototype.add_event=function(e,t){i(t.time&&t.callback),t.original_time=t.time,t.time+=e,this.fast_queue.add(t)},o.prototype.run_events_fired=function(e,t){for(var n=0;this.fast_queue.peek()&&this.fast_queue.peek().time<e&&n<t;){var a=this.fast_queue.poll();0==a.stale&&(a.recurring&&this.add_event(e,{time:a.original_time,callback:a.callback,recurring:!0,stale:!1}),a.callback(),n+=1)}},o.prototype.clear_events=function(){this.fast_queue=null,this.fast_queue=new a((function(e,t){return e.time<t.time}))},e.exports=o},151:function(e,t,n){var a=n(48);function i(e){this.track_all_contacts=!0,this.state=void 0,this.body=e,this.interaction_callback=void 0,this.uuid=a(),this.viva_color=void 0,this.events=[],this.location=void 0,this.home=void 0,this.cohorts=[],this.color=void 0,this.home_state={},this.migrating=!1,this.masked=!1,this.immunized=!1}i.prototype.add_body=function(e){this.body=e},i.prototype.register_interaction_callback=function(e){this.interaction_callback=e},i.prototype.handle_agent_contact=function(e){this.interaction_callback(e)},i.prototype.draw_mask=function(e,t){e.fillStyle="#FFFFFF",e.strokeStyle="#000000",e.lineWidth=1,e.fillRect(this.body.position.x-t,this.body.position.y,2*t,t-1),e.strokeRect(this.body.position.x-t,this.body.position.y,2*t,t-1),e.stroke()},e.exports=i},168:function(e,t,n){"use strict";n.r(t);var a=n(0),i=n.n(a),o=n(13),r=n.n(o),s=n(17),c=n(196),l=n(198),d=n(200),m=n(199),u=n(201),h=n(203),_=n(205),p=n(204),g=n(202),b=n(206),f=n(207),y=n(44),j=n.n(y),v=n(45),x=n.n(v),O=n(194),k=n(208),w=n(37),E=n(56),C=n(29),B=n(48),N=function(e){var t=e.color_float+C.jStat.exponential.sample(8),n=Math.min(e.contagiousness+C.jStat.normal.sample(0,.1),1);t%=1,this.color_float=t,this.contagiousness=n};function I(e,t){this.parent=void 0,this.interaction_callback=void 0,this.uuid=B(),this.color_float=e||Math.random(),this.mutation_function=N,this.contagiousness=.5}I.prototype.get_offspring=function(e){var t=new I(this.color_float);return Math.random()<e&&this.mutation_function&&t.mutation_function(this),t};var P=I,A=n(1),S=n(15),T=(n(62),function(e){var t=e.InfectiousMatterRef,n=e.InfectiousMatterAPI,i=e.redraw_trigger,o=e.setWorldReadyTrigger,r=e.locationImmunity,s=e.popSize,c=Object(a.useRef)(null),l=function(e){var a={type:"residence",friction:.05,immunized_frac:e[0],bounds:{min:{x:10,y:10},max:{x:150,y:150}}},i=S.Common.clone(a);i.bounds.min.x=160,i.bounds.max.x=300,i.immunized_frac=e[1];var o=S.Common.clone(a);o.bounds.min.x=310,o.bounds.max.x=450,o.immunized_frac=e[2];var r=S.Common.clone(a);r.bounds.min.x=460,r.bounds.max.x=600,r.immunized_frac=e[3];var c=S.Common.clone(a);c.bounds.min.x=610,c.bounds.max.x=750,c.immunized_frac=e[4];var l=n(t,{type:"add_location",payload:{residence_props:a}}),d=n(t,{type:"add_location",payload:{residence_props:i}}),m=n(t,{type:"add_location",payload:{residence_props:o}}),u=n(t,{type:"add_location",payload:{residence_props:r}}),h=n(t,{type:"add_location",payload:{residence_props:c}});n(t,{type:"add_agents",payload:{residence:l,num_agents:s/5}}),n(t,{type:"add_agents",payload:{residence:d,num_agents:s/5}}),n(t,{type:"add_agents",payload:{residence:m,num_agents:s/5}}),n(t,{type:"add_agents",payload:{residence:u,num_agents:s/5}}),n(t,{type:"add_agents",payload:{residence:h,num_agents:s/5}}),S.Common.shuffle(t.current.agents)};return Object(a.useEffect)((function(){var e={sim_time_per_day:1e3,agent_size:2,link_lifetime:200};e.link_lifetime=7*e.sim_time_per_day;console.log("initalizing matter"),t.current=new ae(!1,e,{per_contact_infection:.5,incubation_period_mu:5,incubation_period_sigma:3,infectious_period_mu:7,infectious_period_sigma:4,fraction_asymptomatic:.2,asymptomatic_infectious_period_mu:1.5,asymptomatic_infectious_period_sigma:1.5,fraction_seek_care:.5,fraction_isolate:.2,time_to_seek_care:2.5,movement_scale:1},{viva_colors:[2846468607,2846468607,2846468607,2846468607,2846468607,2846468607,2846468607],matter_colors:["darkgrey","darkgrey","darkgrey","darkgrey","darkgrey","darkgrey","darkgrey"]}),n(t,{type:"setup_environment",payload:{sim_div:c}}),l(r)}),[]),Object(a.useLayoutEffect)((function(){t.current&&(l(r),o((function(e){return e+1})))}),[i]),Object(A.jsx)("div",{children:Object(A.jsx)("div",{ref:c,style:{height:160,width:"auto"}})})}),z=n(15);n(142);var M=n(143).MatterCollisionEvents;z.use("matter-wrap",M),z._seed=2,Math.random=z.Common.random,C.jStat._random_fn=z.Common.random;var R=n(82),W=n(62),L=new W.Graph.graph,F=n(147),D=n(148),q=n(149),H=n(151),U=n(152),V=(U({colormap:"chlorophyll",nshades:9,format:"hex",alpha:1}),U({colormap:"portland",nshades:15,format:"hex",alpha:1}),n(154)(["white"])),G={SUSCEPTIBLE:0,INFECTED:1,RECOVERED:2,IMMUNE:3,size:4},J=z.Engine,Y=z.Render,Z=z.World,K=(z.Body,z.Bodies),Q=(z.Bounds,z.Mouse),X=z.MouseConstraint,$=z.Events,ee={sim_time_per_day:2e3,agent_size:3,link_lifetime:4e3,pathogen_mut_prob:.1},te={per_contact_infection:.5,incubation_period_mu:5,incubation_period_sigma:3,infectious_period_mu:7,infectious_period_sigma:4,fraction_asymptomatic:.2,asymptomatic_infectious_period_mu:1.5,asymptomatic_infectious_period_sigma:1.5,fraction_seek_care:.5,fraction_isolate:.2,time_to_seek_care:2.5,movement_scale:.2,use_pathogen_contagiousness:!1},ne={viva_colors:[2332068863,16711935,4294902015,4289003775,65535,2846468607,4278255615,13554175,2566625535,3448061951],matter_colors:["darkmagenta","lime","yellow","orange","blue","darkgrey","fuchsia","darkturquoise","palegreen","peru"]};function ae(e,t,n,a){this.simulation_params=z.Common.extend(ee,t),this.infection_params=z.Common.extend(te,n),this.simulation_colors=z.Common.extend(ne,a),this.matter_world=Z.create(),this.headless=e||!1,this.pathogen_color_range=V,console.log("creating infectious matter environment!"),this.matter_engine=J.create({positionIterations:15,velocityIterations:15,constraintIterations:10}),this.matter_engine.world.gravity.y=0,this.event_queue=new q,this.migration_graph=new W.Graph.graph}ae.prototype.setup_renderer=function(e){var t=e;this.matter_render=Y.create({element:t,engine:this.matter_engine,options:{height:t.offsetHeight,width:t.offsetWidth,background:"rgba(229,229,229)",wireframes:!1}});var n=Q.create(this.matter_render.canvas);this.mouseConstraint=X.create(this.matter_engine,{mouse:n,constraint:{stiffness:.1,render:{visible:!0}}}),n.element.removeEventListener("mousewheel",n.mousewheel),n.element.removeEventListener("DOMMouseScroll",n.mousewheel),this.matter_render.mouse=n,Z.add(this.matter_engine.world,this.mouseConstraint),Y.run(this.matter_render),J.run(this.matter_engine)},ae.prototype.run_headless=function(e){if(e=e||30,this.run_headless)for(var t=0;t<e*this.simulation_params.sim_time_per_day;t++){this.event_queue.run_events_fired(this.cur_sim_time,500);z.Common.choose(this.agents);J.update(this.matter_engine,1e3/60),this.cur_sim_time=this.matter_engine.timing.timestamp}},ae.prototype.setup_matter_env=function(){var e=this;L.clear(),this.locations=[],this.migration_graph.clear(),this.location_uuid_hash={},this.agents=[],this.cohorts=[],this.cur_sim_time=0,this.state_counts=[],this.matter_engine.timing.timestamp=0;for(var t=0;t<G.size;t++)this.state_counts.push(0);this.headless||($.on(this.matter_render,"beforeRender",(function(t){e.cur_sim_time=t.timestamp,e.event_queue.run_events_fired(e.cur_sim_time,500)})),$.on(this.matter_render,"afterRender",(function(t){var n=e.matter_render.context;if(n)for(var a=0;a<e.locations.length;a++)e.locations[a].draw_borders(n)}))),this.add_event({time:100,callback:this.pulse_orgs_event(),recurring:!0,stale:!1})},ae.prototype.update_org_state=function(e,t){var n=e.agent_object.state;e.agent_object.state=t,"undefined"!==typeof n&&(this.state_counts[n]-=1),this.state_counts[t]+=1,e.render.lineWidth=3;var a=e.render.strokeStyle;switch(t){case G.INFECTED:a="red",e.render.fillStyle="red",4278190335;break;case G.RECOVERED:a="red",e.render.fillStyle=e.agent_object.home_color,4294967295;break;case G.SENSITIVE:a="black",e.render.lineWidth=3;break;case G.IMMUNE:a="grey"}return e.render.strokeStyle=a,e},ae.prototype.add_location=function(e,t){var n=new F(e);return n.border_color=t.border_color,n.set_bounds(t.bounds),n.friction=t.friction,n.type=t.type||"none",n.immunized_frac=t.immunized_frac||0,n.home_color=this.simulation_colors.matter_colors[this.locations.length],n.viva_node_color=this.simulation_colors.viva_colors[this.locations.length],this.locations.push(n),this.location_uuid_hash[n.uuid]=n,n},ae.prototype.add_cohort=function(){var e=new D;return this.cohorts.push(e),e},ae.prototype.assign_cohort=function(e,t){t.add_agent(e.agent_object)},ae.prototype.expose_org=function(e,t,n){var a=this;n&&n.pathogen?e.agent_object.pathogen=n.pathogen.get_offspring(this.simulation_params.pathogen_mut_prob):e.agent_object.pathogen=new P(.5,"root"),this.update_org_state(e,G.INFECTED),this.post_infection_callback&&this.post_infection_callback(e.agent_object,n);var i={time:Math.max(C.jStat.exponential.sample(1/this.infection_params.infectious_period_mu),3)*this.simulation_params.sim_time_per_day,callback:function(){a.update_org_state(e,G.RECOVERED)},stale:!1};this.add_event(i),e.agent_object.events.push(i)},ae.prototype.register_infection_callback=function(e){this.post_infection_callback=e},ae.prototype._check_edge_for_removal=function(e){var t=this;return function(){e.data.timestamp<t.cur_sim_time-t.simulation_params.link_lifetime?L.removeLink(e):t.add_event({time:t.cur_sim_time+t.simulation_params.link_lifetime-e.data.timestamp,callback:t._check_edge_for_removal(e),stale:!1})}},ae.prototype.update_colors=function(e){var t=this;this.simulation_colors=z.Common.extend(this.simulation_colors,e),console.log(this.simulation_colors),this.locations.forEach((function(e,n){e.home_color=t.simulation_colors.matter_colors[n],e.viva_node_color=t.simulation_colors.viva_colors[n]})),this.agents.forEach((function(e){e.home_color=e.location.home_color,e.body.render.fillStyle=e.home_color,t.update_org_state(e.body,e.state)}))},ae.prototype.calc_prob_infection=function(e,t){return this.infection_params.per_contact_infection},ae.prototype._default_interaction_callback=function(e){var t=this;return function(n){n.state==G.INFECTED&&e.agent_object.state==G.SUSCEPTIBLE&&z.Common.random(0,1)<t.calc_prob_infection(e,n.body)&&t.expose_org(e,G.INFECTED,n),R(n.uuid&&e.agent_object.uuid);var a=L.hasLink(e.agent_object.uuid,n.uuid)||L.hasLink(n.uuid,e.agent_object.uuid);a?a.data.timestamp=t.cur_sim_time:(R(L.hasNode(e.agent_object.uuid)&&L.hasNode(e.agent_object.uuid)),a=L.addLink(e.agent_object.uuid,n.uuid,{origin:e.agent_object.uuid,timestamp:t.cur_sim_time}),t.add_event({time:t.simulation_params.link_lifetime+1,callback:t._check_edge_for_removal(a),stale:!1}))}},ae.prototype.add_agent=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:G.SUSCEPTIBLE;R(e&&e.get_random_position);var n=e.get_random_position(),a=K.circle(n.x,n.y,this.simulation_params.agent_size,{plugin:{wrap:e.bounds}});return a.strokeStyle="black",a.lineWidth=2,a.agent_object=new H(a),a.frictionAir=e.friction,a.friction=0,a.restitution=1.1,a.node=L.addNode(a.agent_object.uuid,{something:!0}),a.agent_object.home=e,a.agent_object.color=e.home_color||"black",a.agent_object.viva_color=e.viva_node_color,a.render.fillStyle=a.agent_object.color,e.add_agent(a.agent_object),a.agent_object.register_interaction_callback(this._default_interaction_callback(a,this.get_prob_of_infection)),a.onCollide((function(e){e.bodyA===a&&e.bodyB.agent_object?e.bodyA.agent_object.handle_agent_contact(e.bodyB.agent_object):e.bodyB===a&&e.bodyA.agent_object&&e.bodyB.agent_object.handle_agent_contact(e.bodyA.agent_object)})),Z.add(this.matter_engine.world,a),this.agents.push(a.agent_object),this.update_org_state(a,t),a},ae.prototype.delete_agent=function(e){this.agents=this.agents.filter((function(t){return t!==e})),z.Composite.remove(this.matter_engine.world,e.body),L.removeNode(e.uuid),this.state_counts[e.state]-=1,e.events.forEach((function(e){e.stale=!0})),e.location.remove_agent(e)},ae.prototype.add_event=function(e){R(e.time&&e.callback),this.event_queue.add_event(this.cur_sim_time,e)},ae.prototype.set_agent_contact_callback=function(e){this.agent_contact_callback=e},ae.prototype.clear_simulator=function(){Z.clear(this.matter_engine.world),J.clear(this.matter_engine),this.event_queue.clear_events()},ae.prototype.remove_simulator=function(){this.clear_simulator(),Y.stop(),this.matter_engine.events={},this.matter_render.canvas.remove(),this.matter_render.canvas=null,this.matter_render.context=null,this.matter_render.textures={},this.matter_world=null,this.matter_engine=null,this.event_queue=null,this.matter_render=null,this.mouseConstraint=null},ae.prototype.pulse_orgs_event=function(){var e=this;return function(){if(e.agents.length>0)for(var t=0;t<200;t++){var n=z.Common.choose(e.agents);z.Body.applyForce(n.body,n.body.position,{x:z.Common.random(-2e-5*e.infection_params.movement_scale,2e-5*e.infection_params.movement_scale),y:z.Common.random(-2e-5*e.infection_params.movement_scale,2e-5*e.infection_params.movement_scale)})}}},ae.prototype.get_migration_links=function(){var e=[];return this.migration_graph.forEachLink((function(t){e.push({from_uuid:t.fromId,to_uuid:t.toId,num_agents:t.data.num_agents})})),e},ae.prototype.add_migration_link=function(e,t,n){var a=this.migration_graph.hasLink(e,t);a?a.data.num_agents=n:this.migration_graph.addLink(e,t,{num_agents:n})},ae.prototype.remove_migration_link=function(e,t){var n=this.migration_graph.hasLink(e,t);n&&this.migration_graph.removeLink(n)},ae.prototype.new_migration_event=function(){var e=this;return function(){e.migration_graph.forEachLink((function(t){var n=e.location_uuid_hash[t.fromId],a=e.location_uuid_hash[t.toId];n.try_getting_random_residents(t.data.num_agents).forEach((function(t){t.home_state={location:n,position:Object(E.a)({},t.body.position),velocity:Object(E.a)({},t.body.velocity)},n.migrate_to(a,t,(function(e){e.body.plugin.wrap=a.bounds,z.Body.setPosition(e.body,a.get_random_position()),e.body.frictionAir=a.friction,e.migrating=!0})),e.add_event({time:e.simulation_params.sim_time_per_day,callback:function(){a.migrate_to(n,t,(function(e){z.Body.setPosition(e.body,t.home_state.position),e.body.plugin.wrap=n.bounds,z.Body.setVelocity(e.body,t.home_state.velocity),e.body.frictionAir=n.friction,e.migrating=!1}))}})}))}))}};var ie=n(15),oe=n.n(ie),re=n(209),se=n(210),ce=n(197),le=Object(O.a)((function(e){return{root:{minWidth:300,minHeight:300},controlls:{width:300},paper:{height:300,width:300,textAlign:"center"},sim_paper:{height:160,width:760,textAlign:"center"},paperControlls:{minHeight:300,minWidth:300,textAlign:"center",padding:e.spacing(1)}}})),de=function(e){le();return Object(A.jsxs)(c.a,{container:!0,direction:"row",justify:"flex-start",alignItems:"center",spacing:3,children:[Object(A.jsx)(c.a,{item:!0,children:Object(A.jsx)(se.a,{src:"static/lz_small.png"})}),Object(A.jsx)(c.a,{item:!0,children:Object(A.jsx)(w.a,{children:Object(A.jsx)(ce.a,{color:"inherit",href:"https://infectiousmatter.com/index.html#about_me",children:"Luis Zaman"})})}),Object(A.jsx)(c.a,{item:!0,children:Object(A.jsx)(w.a,{variant:"overline",display:"block",children:e.date})})]})},me=n(12),ue=Object(O.a)((function(e){return{root:{flexGrow:0,minWidth:600},Typography:{},headingPanel:{marginTop:"50vh"},contentPanel:{marginTop:"40vh",minHeight:"80vh"},subPanel:{marginTop:"10vh",minHeight:"20vh"},introFooter:{marginTop:"10vh"},stickyContent:{marginTop:"3vh",position:"sticky",top:0,zIndex:2e3},topPadding:{marginTop:"15px"},sim_paper:{height:160,width:760,alignItems:"center",justifyContent:"center",marginBottom:"1vh"},slider:{minWidth:150},controlCard:{minWidth:300,padding:5,margin:"10vw"},sim_card:{minWidth:760,padding:3,zIndex:-1e3}}}));ae.prototype.mask_transmission_props={self_protection:.05,others_protection:.5},ae.prototype.calc_prob_infection=function(e,t){var n=this.infection_params.per_contact_infection;return e.agent_object.masked&&t.agent_object.masked?n*(1-this.mask_transmission_props.self_protection)*(1-this.mask_transmission_props.others_protection):e.agent_object.masked&&!t.agent_object.masked?n*(1-this.mask_transmission_props.self_protection):!e.agent_object.masked&&t.agent_object.masked?n*(1-this.mask_transmission_props.others_protection):e.agent_object.masked||t.agent_object.masked?void 0:n};var he=function e(t,n){if("setup_environment"==n.type&&(t.current.setup_renderer(n.payload.sim_div.current),t.current.setup_matter_env()),"update_infection_params"==n.type&&(n.payload.per_contact_infection&&(t.current.infection_params.per_contact_infection=n.payload.per_contact_infection),n.payload.infectious_period_mu&&(t.current.infection_params.infectious_period_mu=n.payload.infectious_period_mu)),"update_mask_transmission_params"==n.type&&(n.payload.self_protection&&(t.current.mask_transmission_props.self_protection=n.payload.self_protection),n.payload.others_protection&&(t.current.mask_transmission_props.others_protection=n.payload.others_protection)),"update_movement_scale"==n.type&&n.payload.movement_scale&&(t.current.infection_params.movement_scale=n.payload.movement_scale),"reset_simulator"==n.type&&(t.current.clear_simulator(),t.current.setup_matter_env()),"add_location"==n.type)return t.current.add_location("residence",n.payload.residence_props);if("add_random_agent"==n.type){var a=oe.a.Common.choose(t.current.locations),i=t.current.add_agent(a);oe.a.Common.random(0,1)<a.immunized_frac&&t.current.update_org_state(i,G.IMMUNE),n.payload&&n.payload.callback&&i&&n.payload.callback(i.agent_object)}if("remove_random_agent"==n.type){var o=oe.a.Common.choose(t.current.agents);t.current.delete_agent(o)}if("add_agents"==n.type){var r=null;if(n.payload.residence&&n.payload.num_agents)for(var s=0;s<n.payload.num_agents;s++)r=t.current.add_agent(n.payload.residence),oe.a.Common.random(0,1)<n.payload.residence.immunized_frac&&t.current.update_org_state(r,G.IMMUNE);n.payload.callback&&r&&n.payload.callback(r.agent_object)}if("map_agents"==n.type)return t.current.agents.map((function(e,t){return n.payload.callback(e,t)}));if("forEach_agents"==n.type&&t.current.agents.forEach((function(e){return n.payload.callback(e)})),"map_locations"==n.type)return t.current.locations.map((function(e,t){return n.payload.callback(e,t)}));if("forEach_location"==n.type&&t.current.locations.forEach((function(e){return n.payload.callback(e)})),"infect_random_agents"==n.type&&n.payload.num_agents)for(var c=0;c<n.payload.num_agents;c++){var l=oe.a.Common.choose(t.current.agents);t.current.expose_org(l.body,G.INFECTED)}if("infect_random_agent_everywhere"==n.type&&n.payload.num_agents&&t.current.locations.forEach((function(e){for(var a=e.try_getting_random_residents(2*n.payload.num_agents),i=0;i<n.payload.num_agents;i++)t.current.expose_org(a[i].body,G.INFECTED)})),"get_migration_links"==n.type)return t.current.get_migration_links();if("add_migration_link"==n.type&&t.current.add_migration_link(n.payload.from_location,n.payload.to_location,n.payload.num_agents),"clear_migration_links"==n.type&&t.current.migration_graph.clear(),"remove_migration_link"==n.type&&t.current.remove_migration_link(n.payload.from_location,n.payload.to_location),"get_state_counts"==n.type)return{state_counts:t.current.state_counts,cur_time:t.current.cur_sim_time/t.current.simulation_params.sim_time_per_day};if("set_num_mask"==n.type){var d=[],m=[];t.current.agents.forEach((function(e){e.masked?d.push(e):m.push(e)}));var u=d.length,h=n.payload.num_masked-u;if(h>0)for(var _=0;_<h;_++)m[_].masked=!0;else if(h<0)for(var p=0;p<-h;p++)d[p].masked=!1}if("set_pop_size"==n.type){var g=n.payload.pop_size-t.current.agents.length;if(g>0)for(var b=0;b<g;b++)e(t,{type:"add_random_agent"});else if(g<0)for(var f=0;f<-g;f++)e(t,{type:"remove_random_agent"})}},_e=function(e){var t=ue(),n=Object(a.useRef)(null),i=Object(a.useState)([.1,.3,.5,.7,.9]),o=Object(s.a)(i,2),r=o[0],y=o[1],v=Object(a.useState)(600),O=Object(s.a)(v,2),E=O[0],C=(O[1],Object(a.useState)(2)),B=Object(s.a)(C,2),N=B[0],I=B[1],P=Object(a.useState)(0),S=Object(s.a)(P,2),z=S[0],M=S[1],R=Object(a.useState)(0),W=Object(s.a)(R,2),L=(W[0],W[1]),F=Object(a.useState)(!1),D=Object(s.a)(F,2),q=(D[0],D[1]),H=Object(a.useState)(!1),U=Object(s.a)(H,2),V=(U[0],U[1]),G=Object(a.useState)(!1),J=Object(s.a)(G,2),Y=J[0],Z=J[1],K=function(e){y(e),he(n,{type:"reset_simulator"}),M((function(e){return e+1}))},Q=function(e){K([.1,.3,.5,.7,.9])},X=function(e){he(n,{type:"infect_random_agent_everywhere",payload:{num_agents:e}})};return Object(a.useEffect)((function(){he(n,{type:"update_movement_scale",payload:{movement_scale:N}})}),[N]),Object(a.useEffect)((function(){he(n,{type:"set_pop_size",payload:{pop_size:E}}),L((function(e){return e+1}))}),[E]),Object(A.jsx)("div",{className:"App",children:Object(A.jsxs)(me.a,{offset:.5,onStepEnter:function(e){e.element;var t=e.data;"up"!=e.direction&&(console.log(t),1==t&&q(!0),2==t&&V(!0),"show_sim"==t&&Z(!0),"infect_agents"==t&&X(1),"infect_3_agents"==t&&(K([.5,.5,.5,.5,.5]),I(1.5),X(3)),"movement_reinfect"==t&&(Q(),I(4)),"single_immunity"==t&&(K([.5,.5,.5,.5,.5]),I(1.5)))},children:[Object(A.jsx)(me.b,{data:1,children:Object(A.jsxs)(l.a,{className:t.headingPanel,children:[Object(A.jsx)(w.a,{variant:"h2",component:"h2",gutterBottom:!0,children:"Our Race Towards Herd Immunity"}),Object(A.jsx)(de,{date:"April 9th, 2021"})]})},1),Object(A.jsx)(me.b,{data:2,children:Object(A.jsxs)(l.a,{children:[Object(A.jsx)(m.a,{in:!0,children:Object(A.jsxs)(l.a,{className:t.subPanel,children:[Object(A.jsxs)(w.a,{variant:"h5",gutterBottom:!0,children:["A year ago, I built ",Object(A.jsx)(ce.a,{color:"inherit",href:"https://infectiousmatter.com",children:"InfectiousMatter"})," to help folks gain an intuition for disease transmission dynamics without having to wait and learn from our own mistakes. A year later, we've all unfortunately learned more than expected."]}),Object(A.jsx)(ce.a,{color:"inherit",href:"https://infectiousmatter.com",children:Object(A.jsx)("img",{src:"static/teaser.png",height:"200"})})]})}),Object(A.jsx)(l.a,{className:t.subPanel,children:Object(A.jsxs)(w.a,{variant:"h5",gutterBottom:!0,className:t.subPanel,children:["Now we have multiple vaccines being administered around the world at incredible speeds (all things considered). We're truly racing towards ",Object(A.jsx)("i",{children:"herd immunity"}),". But how fast we get there and how many lives are saved along the way depend on the decisions we collectively make in the next few months."]})}),Object(A.jsx)(l.a,{className:t.subPanel,children:Object(A.jsx)(w.a,{variant:"h5",gutterBottom:!0,className:t.subPanels,children:"Throughout the pandemic, limiting transmission has been critical to avoid overwhelming our healthcare systems. While that is still the true, we have even more to gain (or lose) by making hard choices in our final push towards a return to normalcy."})})]})},2),Object(A.jsx)(me.b,{data:123,children:Object(A.jsx)(l.a,{children:Object(A.jsxs)(l.a,{className:t.subPanel,children:[Object(A.jsx)(w.a,{variant:"h5",gutterBottom:!0,children:"What is herd immunity anyway?"}),Object(A.jsxs)(w.a,{variant:"body1",gutterBottom:!0,children:["Roughly speaking, it's the level of immunity that will prevent a pathogen from spreading through a population. The proportion of immune people needed depends on several details of the pathogen and the population. For SARS-CoV-2, we'll probably need to reach between 70% - 80% immune. There was a ",Object(A.jsx)(ce.a,{href:"https://www.npr.org/sections/health-shots/2021/02/18/967462483/how-herd-immunity-works-and-what-stands-in-its-way",children:"really neat interactive"})," on NPR that goes into more detail about what herd immunity is, and how it's affected by the more transmissible variants now circulating."]}),Object(A.jsx)(w.a,{variant:"h6",gutterBottom:!0,children:"However, our extreme focus on immunization is overshadowing a major part of the challenge we're facing."}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,children:"Don't get me wrong, vaccination absolutely deserves the attention and effort it's getting right now. But it isn't our only hurdle left. With a large increase in infections here in Michigan and around the world, our ability to end disease spread just by reaching herd immunity will be a major challenge."})]})})},123),Object(A.jsx)(me.b,{data:"show_sim",children:Object(A.jsx)(l.a,{children:Object(A.jsxs)(l.a,{className:t.subPanel,children:[Object(A.jsx)(w.a,{variant:"h5",gutterBottom:!0,children:"Exploring Herd Immunity"}),Object(A.jsxs)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:["Let's use this interactive epidemic simulator to build our intuition for what herd immunity is, and what it isn't. As you scroll, you'll see a simulation appear where lots of grey balls are bouncing around in boxes. These bouncing balls represent individuals, and each box represents a different independent community. If you missed the ",Object(A.jsx)(ce.a,{href:"https://infectiousmatter.com",children:"original walk-through for InfectiousMatter"}),", definitely check it out for a longer introduction to this kind of model of disease dynamics!"]}),Object(A.jsxs)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:["You might notice that there are different borders on some of the bouncing balls. The dark border indicates ",Object(A.jsx)("b",{children:"Susceptible"})," individuals, while the lighter border depicts ",Object(A.jsx)("b",{children:"Immune"})," individuals."]}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"The level of immunity in a particular community (i.e., box) is a gradient that increases as you move from the left (at 10% immune) to the far right (90% immunity)."})]})})}),Object(A.jsx)(me.b,{data:3,children:Object(A.jsx)(l.a,{className:t.stickyContent,children:Object(A.jsx)(d.a,{in:Y,children:Object(A.jsx)(k.a,{elevation:5,className:t.sim_card,children:Object(A.jsxs)(c.a,{container:!0,className:t.root,alignItems:"center",direction:"column",justify:"flex-start",spacing:0,margin:10,children:[Object(A.jsx)(c.a,{item:!0,children:Object(A.jsx)("img",{src:"static/legend.png",width:400})}),Object(A.jsx)(c.a,{item:!0,children:Object(A.jsx)(k.a,{className:t.sim_paper,children:Object(A.jsx)(T,{InfectiousMatterRef:n,InfectiousMatterAPI:he,redraw_trigger:z,setWorldReadyTrigger:L,locationImmunity:r,popSize:E})})})]})})})})},3),Object(A.jsx)(me.b,{data:"infect_agents",children:Object(A.jsx)(l.a,{children:Object(A.jsxs)(l.a,{className:t.subPanel,children:[Object(A.jsx)(w.a,{variant:"h5",gutterBottom:!0,children:"Introducing a Single Infection"}),Object(A.jsxs)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:["As you keep scrolling, you'll see a single individual turn red in each of the communities. This is an ",Object(A.jsx)("b",{children:"Infected"})," agent that is capable of spreading infection to other susceptible individuals. When infected agents recover, they retain a red border so you can easily see how big the epidemic was in each community."]}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"This simulation is running live in your browser window, and randomness means each time you visit the page something slightly different will happen. Hopefully you could see that the pathogen doesn't really take hold in communities with high levels of immunity."}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"At the end of this walk-through, you'll have a chance to re-run this simulation and manipulate some parameters to get a feeling for how they affect the pathogen spread!"}),Object(A.jsx)(w.a,{variant:"h6",gutterBottom:!0,className:t.topPadding,children:"TODO: Add screenshots of many trials?"})]})})},4),Object(A.jsx)(me.b,{data:"movement_reinfect",children:Object(A.jsx)(l.a,{className:t.headingPanel,children:Object(A.jsxs)(l.a,{children:[Object(A.jsx)(w.a,{variant:"h5",gutterBottom:!0,children:"Relaxed Social Distancing"}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"Pandemic burnout is real. And if you mix that with the nice weather, increasingly accessible vaccines, and easing restrictions, it's easy to imagine people also starting to relax their own cautious behaviors."})]})})},5),Object(A.jsx)(me.b,{data:"infect_agents",children:Object(A.jsx)(l.a,{children:Object(A.jsxs)(l.a,{children:[Object(A.jsxs)(w.a,{variant:"h5",gutterBottom:!0,className:t.topPadding,children:[Object(A.jsx)("br",{}),"Now let's see what happens when the same single infected agent does in our more active populations."]}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"You probably noticed that more individuals ended up infected, and the pathogen might have spread in communities that were previously protected."}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"That's because increasing interactions also increases the amount of immunity required to protect a community."}),Object(A.jsx)(w.a,{variant:"h6",gutterBottom:!0,className:t.topPadding,children:"TODO: Add screenshots of many trials?"})]})})},12),Object(A.jsx)(me.b,{data:"single_immunity",children:Object(A.jsx)(l.a,{children:Object(A.jsxs)(l.a,{className:t.headingPanel,children:[Object(A.jsx)(w.a,{variant:"h5",gutterBottom:!0,className:t.topPadding,children:"Focusing on Intermediate Immunity"}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"Let's slow things down and set the level of immunity to be 50% in every community. I'm doing this so you can see how random chance plays a critical role in whether or not a large outbreak occurs when infections are introduced."})]})})},6),Object(A.jsx)(me.b,{data:"infect_agents",children:Object(A.jsx)(l.a,{children:Object(A.jsxs)(l.a,{className:t.topPadding,children:[Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"When you scrolled here, we'll automatically infect a single agent in each population again. You'll hopefully see that some communities remain almost entirely untouched while others have large outbreaks."}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"Remember that each community has the same amount of immunity, so the differences between outbreaks is entirely driven by chance!"}),Object(A.jsx)("div",{className:t.subPanel,children:Object(A.jsx)(w.a,{variant:"h5",gutterBottom:!0,children:"This is precisely when small changes in behavior can have HUGE effects on the severity of an outbreak!"})})]})})},17),Object(A.jsx)(me.b,{data:"infect_3_agents",children:Object(A.jsx)(l.a,{children:Object(A.jsxs)(l.a,{children:[Object(A.jsx)(w.a,{variant:"h5",gutterBottom:!0,className:t.topPadding,children:"For Example"}),Object(A.jsx)(w.a,{variant:"body1",gutterBottom:!0,className:t.topPadding,children:"Even a slight increase in the number of infections that are introduced to communities can shift the balance towards larger outbreaks."})]})})},8),Object(A.jsx)(me.b,{data:"something",children:Object(A.jsx)(l.a,{children:Object(A.jsxs)(l.a,{children:[Object(A.jsx)(w.a,{children:"Just going from 1 to 3 infected individuals, the outbreaks are substantially larger!"}),Object(A.jsx)(w.a,{variant:"h6",gutterBottom:!0,className:t.topPadding,children:"TODO: Add screenshots of many trials? (both with 1 and with 3)"})]})})},7),Object(A.jsx)(me.b,{children:Object(A.jsx)(l.a,{className:t.contentPanel,children:Object(A.jsxs)(l.a,{children:[Object(A.jsx)(w.a,{variant:"h4",gutterBottom:!0,color:"secondary",children:"Takeaway"}),Object(A.jsx)(w.a,{variant:"h6",gutterBottom:!0,className:t.topPadding,children:"Vaccination absolutely works as a way to reduce the number and severity of disease outbreaks. But it isn't the only ingredient needed to stop a pandemic."}),Object(A.jsx)(w.a,{variant:"h6",gutterBottom:!0,className:t.topPadding,children:"As we rapidly approach herd immunity, controling the spread of outbreaks that are ongoing and preventing new ones from starting will be critical. As you've now seen first hand, small effects are amplified when we're close to herd immunity, and that can help us get back to normal faster \u2014 or not."})]})})}),Object(A.jsx)(me.b,{children:Object(A.jsx)(l.a,{children:Object(A.jsx)(l.a,{children:Object(A.jsx)(k.a,{className:t.controlCard,children:Object(A.jsxs)(u.a,{component:"div",dense:!0,children:[Object(A.jsx)(g.a,{children:" Population Settings"}),Object(A.jsxs)(h.a,{children:[Object(A.jsx)(p.a,{children:"Individual Movement"}),Object(A.jsx)(_.a,{className:t.slider,children:Object(A.jsx)(re.a,{value:N,valueLabelDisplay:"off",onChange:function(e,t){I(t)},step:.25,min:0,max:10})})]}),Object(A.jsx)(b.a,{}),Object(A.jsx)(g.a,{children:"Reset Population"}),Object(A.jsxs)(h.a,{children:[Object(A.jsx)(p.a,{primary:"Reset With Immunity Gradient",secondary:"(10% - 90%)"}),Object(A.jsx)(_.a,{children:Object(A.jsx)(f.a,{size:"small",onClick:function(){Q()},color:"primary",children:Object(A.jsx)(j.a,{})})})]}),Object(A.jsxs)(h.a,{children:[Object(A.jsx)(p.a,{children:"Reset All To 50% Immunity"}),Object(A.jsx)(_.a,{children:Object(A.jsx)(f.a,{size:"small",onClick:function(){K([.5,.5,.5,.5,.5])},color:"primary",children:Object(A.jsx)(j.a,{})})})]}),Object(A.jsxs)(h.a,{children:[Object(A.jsx)(p.a,{children:"Reset All To 80% Immunity"}),Object(A.jsx)(_.a,{children:Object(A.jsx)(f.a,{size:"small",onClick:function(){K([.8,.8,.8,.8,.8])},color:"primary",children:Object(A.jsx)(j.a,{})})})]}),Object(A.jsx)(b.a,{}),Object(A.jsx)(g.a,{children:"Infection Actions"}),Object(A.jsxs)(h.a,{children:[Object(A.jsx)(p.a,{primary:"Infect One Individual",secondary:"per population"}),Object(A.jsx)(_.a,{children:Object(A.jsx)(f.a,{size:"small",onClick:function(){X(1)},color:"secondary",children:Object(A.jsx)(x.a,{})})})]}),Object(A.jsxs)(h.a,{children:[Object(A.jsx)(p.a,{primary:"Infect Two Individuals"}),Object(A.jsx)(_.a,{children:Object(A.jsx)(f.a,{size:"small",onClick:function(){X(2)},color:"secondary",children:Object(A.jsx)(x.a,{})})})]}),Object(A.jsxs)(h.a,{children:[Object(A.jsx)(p.a,{primary:"Infect Three Individuals"}),Object(A.jsx)(_.a,{children:Object(A.jsx)(f.a,{size:"small",onClick:function(){X(3)},color:"secondary",children:Object(A.jsx)(x.a,{})})})]})]})})})})}),Object(A.jsx)(me.b,{children:Object(A.jsx)(l.a,{className:t.subPanel})})]})})};r.a.render(Object(A.jsx)(i.a.StrictMode,{children:Object(A.jsx)(_e,{})}),document.getElementById("root"))}},[[168,1,2]]]);
//# sourceMappingURL=main.b1de47e7.chunk.js.map