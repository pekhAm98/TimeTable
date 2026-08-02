import { TrainFront, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header className="
      border-b border-emerald-500/20
      bg-black/40
      backdrop-blur-xl
    ">
      <div className="
        mx-auto flex h-20 max-w-7xl
        items-center justify-between px-8
      ">

        <div className="flex items-center gap-3">

          <div className="
            flex h-10 w-10 items-center justify-center
            rounded-xl
            bg-emerald-500/20
            text-emerald-400
            shadow-[0_0_25px_rgba(16,185,129,0.5)]
          ">
            <TrainFront size={24}/>
          </div>


          <h1 className="
            text-xl font-semibold
            text-white
          ">
            Metro
            <span className="text-emerald-400">
              {" "}Timetable Manager
            </span>
          </h1>

        </div>


        <div className="
          flex items-center gap-2
          text-slate-300
        ">
          <UserCircle size={22}/>
          <span>
            Admin
          </span>
        </div>


      </div>
    </header>
  );
}