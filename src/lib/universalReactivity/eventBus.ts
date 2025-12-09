class EventBus {
    private eventMap = new Map<string,(((parameters?:any)=>void)|null)[]>();
    constructor() {
        this.eventMap.set('eventBus-ping',[()=>{console.log("Event bus pinged");}]);
        this.eventMap.set('eventBus-show',[()=>{console.log(this.eventMap);}]);
    }

    on(event:string,callback:(parameters?:any)=>void){
        if(this.eventMap.has(event)){
            console.warn("Note this event already has a callback.\nIf you know about it proceed");
            this.eventMap.get(event)?.push(callback);

            return ()=>this.off(event,this.eventMap.get(event)?.length||0);
        } else {
            this.eventMap.set(event,[callback]);
            return ()=>this.off(event,0);
        }
    }

    emit(event:string,parameters?:any){
        if(this.eventMap.has(event)){
            this.eventMap.get(event)?.forEach((callback)=>{if(callback) callback(parameters);});
        } else {
            console.error("No event callback");
        }
    }

    off(event:string,callbackId:number){
        if(this.eventMap.has(event)){
            const callbackList = this.eventMap.get(event);
            callbackList![callbackId]=null;
            this.eventMap.set(event,callbackList||[]);
        } else {
            console.error("You tried to unregister from an event without callbacks");
        }
    }
}

let eventBus:EventBus|null = null

const getEventBus=()=>{
    if(eventBus==null){
        eventBus = new EventBus();
        return eventBus;
    } else {
        return eventBus;
    }
}

export default getEventBus;

