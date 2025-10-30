import {CheckSquare} from 'lucide-react'

export function Hero(){

    return(
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CheckSquare className="w-10 h-10 text-emerald-500" />
            <h1 className="text-5xl sm:text-6xl font-bold text-white">Task Manager</h1>
          </div>
          <p className="text-slate-400 text-lg">Stay organized and productive</p>
        </div>
    )
    
}

