import { useCallback, useRef, useState } from "react";


export default function useStateWithHistory (defaultValue, {capacity=10}={}){
    const [value, setValue] = useState(defaultValue)
    const historyRef = useRef([value])
    const pointerRef = useRef(0)

    console.log(value)
    const set = useCallback (
        v => {
            console.log(v)
            const resolvedValue = typeof v === "function"? v(value): v
            if(historyRef.current[pointerRef.current] !== resolvedValue){
                if(pointerRef.current < historyRef.current.length - 1){
                    historyRef.current.splice(pointerRef.current + 1)
                }   
                
                historyRef.current.push(resolvedValue)
                
                while(historyRef.current.length > capacity){
                    historyRef.current.shift()
                }
                pointerRef.current = historyRef.current.length - 1
            }
            setValue(resolvedValue)
        },
    [capacity, value])


    const back = useCallback(() => {
        console.log("sss")
        if(pointerRef.current <=0 ) return
        pointerRef.current --
        setValue(historyRef.current[pointerRef.current])
    }) 

    const forward = useCallback(() => {
        if(pointerRef.current >= historyRef.current.length-1 ) return
        pointerRef.current ++
        setValue(historyRef.current[pointerRef.current])
    })

    return{value: value, set, history: historyRef.current, pointer: pointerRef, back, forward}
}
