'use client'

import React, { useState, useEffect } from 'react'
import { Search, User, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/drop-down-menu'
import Image from 'next/image'
import Cookies from "react-cookies";
import { logout } from '@/app/commonAPI'

const Navbar = () => {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [userImg, setUserImg] = useState("")
    const [userName, setUserName] = useState(null)
    const [type, setType] = useState(null)
    const [ds, setDs] = useState(null)
    const [ps, setPs] = useState(null)


    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => {
            clearInterval(timer)
        }
    }, [])

    useEffect(() => {
        const base6gImg = sessionStorage.getItem('_img');
        setUserImg(base6gImg);

        const Name = Cookies.load('name');
        setUserName(Name);

        const DS = Cookies.load('district');
        setDs(DS);

        const PS = Cookies.load('ps');
        setPs(PS);

        const TYPE = Cookies.load('type');
        setType(TYPE);
    },[])

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const handleLogout = async() => {
        await logout();
        Cookies.remove('name');
        Cookies.remove('district');
        Cookies.remove('ps');
        Cookies.remove('type');
        Cookies.remove('data');
        window.location.href = "/";
    }

    return (
        <nav className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white">
            <div className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="bg-white/20 border-none text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
            </div>

            <div className="flex items-center space-x-4">
                <DropdownMenu>

                <div className="text-sm">
                    <div>{userName && userName}</div>
                    <div>{(type == 10 || type == 20) ? ds : ps}</div>
                </div>

                    <DropdownMenuTrigger asChild>
                        <div>
                            {userImg ? (
                                <Image
                                    className="rounded-full w-12 h-12"
                                    src={userImg}
                                    alt="User Avatar"
                                    width={50}
                                    height={50}
                                />
                            ) : (
                                <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-blue-500">
                                    U
                                </div>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                 <Button variant="outline" onClick={handleLogout} className ="text-white bg-red-500 hover:bg-slate-200 border-1 border-slate-800">
                  Sign-out
                </Button>
                </DropdownMenu>
            </div>
        </nav>
    )
}

export default Navbar

