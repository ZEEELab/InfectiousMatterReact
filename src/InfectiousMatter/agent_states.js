/*
This should define the set of states an agent can be in

It should also define the callback function for transitions between states
 -- (or should there be a generic callback function that works for a state graph of some sort?)

 var AgentStates = {
    SUSCEPTIBLE: 0,
    INFECTED: 1
    RECOVERED: 2,
    size: 3
};

Transitions between states as functions? 
Rates?

*/


function AgentStates() {
	this.StateSpace =  {
        SUSCEPTIBLE: 0,
        INFECTED: 1,
        RECOVERED: 2
    }
    this.size = 3
    
    

}
