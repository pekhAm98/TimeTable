"use client";

import { useState } from "react";
import { authClient } from "../src/lib/auth-client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }


  return (
    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-slate-950
      via-indigo-950
      to-slate-950
      px-4
    ">

      <div className="
        absolute
        h-96
        w-96
        rounded-full
        bg-cyan-500/20
        blur-3xl
      "/>


      <div className="
        relative w-full max-w-md
rounded-3xl
border border-white/10
bg-white/[0.03]
backdrop-blur-2xl
shadow-[0_0_50px_rgba(6,182,212,0.15)]
p-8
      ">


        <div className="text-center mb-8">

          <div className="
            mx-auto
            mb-4
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-cyan-500/20
            border
            border-cyan-400/30
            shadow-lg
            shadow-cyan-500/20
          ">
            <User className="text-cyan-300" size={32}/>
          </div>


          <h1 className="text-3xl font-bold text-white">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Metro Operations Portal
          </p>

        </div>



        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >


          {/* Name */}

          <InputBox
            icon={<User size={18}/>}
            placeholder="Full Name"
            value={name}
            onChange={setName}
          />



          {/* Email */}

          <InputBox
            icon={<Mail size={18}/>}
            placeholder="Email"
            value={email}
            onChange={setEmail}
            type="email"
          />



          {/* Password */}

          <div>

            <div className="
              flex
              items-center
              rounded-xl
              border
              border-white/10
              bg-black/20
              px-4
            ">

              <Lock
                size={18}
                className="text-slate-400"
              />


              <input
                className="
                  w-full
                  bg-transparent
                  px-3
                  py-3
                  text-white
                  outline-none
                "
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />


              <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white"
              >

                {
                  showPassword
                  ?
                  <EyeOff size={18}/>
                  :
                  <Eye size={18}/>
                }

              </button>

            </div>

          </div>



          <button
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              py-3
              font-semibold
              text-white
              shadow-lg
              shadow-cyan-500/20
              transition
              hover:scale-[1.02]
              hover:shadow-cyan-500/40
              disabled:opacity-50
            "
          >

            {
              loading
              ? "Creating..."
              : "Create Account"
            }

          </button>


        </form>


        <p className="
          mt-8
          text-center
          text-xs
          text-slate-500
        ">
          Internal Metro Operations System
        </p>


      </div>

    </div>
  );
}



function InputBox({
  icon,
  placeholder,
  value,
  onChange,
  type="text"
}:{
  icon:React.ReactNode;
  placeholder:string;
  value:string;
  onChange:(v:string)=>void;
  type?:string;
}){

  return (

    <div className="
      flex
      items-center
      rounded-xl
      border
      border-white/10
      bg-black/20
      px-4
      focus-within:border-cyan-400/50
    ">

      <span className="text-slate-400">
        {icon}
      </span>


      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="
          w-full
          bg-transparent
          px-3
          py-3
          text-white
          outline-none
          placeholder:text-slate-500
        "
      />

    </div>

  );
}