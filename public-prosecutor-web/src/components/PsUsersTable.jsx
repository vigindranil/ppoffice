"use client"

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { decrypt } from "@/utils/crypto";
import SmartPagination from "@/components/SmartPagination";
import { getPsUsers } from "@/app/api";

const PsUsersTable = () => {
    const { toast } = useToast();
    const encryptedUser = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);

    const [user, setUser] = useState(null);
    const [psUsers, setPsUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (encryptedUser) {
            try {
                const decoded_user = JSON.parse(decrypt(encryptedUser));
                setUser(decoded_user);
            } catch (e) {
                console.error("Failed to decrypt user data:", e);
                setError("Failed to load user data.");
            }
        }
    }, [encryptedUser]);

    const fetchPsUsers = useCallback(async () => {
        if (!user?.AuthorityUserID) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = { UserID: user.AuthorityUserID };
            const response = await getPsUsers(payload);

            if (response.status === 0 && Array.isArray(response.data)) {
                setPsUsers(response.data);
                setTotalPages(Math.ceil(response.data.length / usersPerPage));
                if (response.data.length === 0) {
                    toast({
                        title: "No Users Found",
                        description: "No police station users found.",
                        variant: "info",
                    });
                }
            } else {
                throw new Error(response.message || "Failed to fetch police station users.");
            }
        } catch (err) {
            console.error("Error fetching PS users:", err);
            setError(err.message || "An unexpected error occurred while fetching users.");
            toast({
                title: "Error",
                description: err.message || "Failed to fetch police station users.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [user, token, usersPerPage, toast]);

    useEffect(() => {
        fetchPsUsers();
    }, [fetchPsUsers]);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = psUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="relative flex bg-gray-100 h-full min-h-screen w-full px-6">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    {/* <Card className="m-5 shadow-md"> */}
                    <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4 overflow-hidden border-slate-500">
                        <CardHeader className="mb-0 bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
                            <CardTitle className="text-white text-xl">Police Station Users</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="flex flex-col gap-4">
                                <div className="overflow-x-auto">
                                    {/* <h3 className="text-lg font-semibold px-4 pt-4 pb-2">Police Station Users</h3> */}
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow className="bg-slate-100 hover:bg-slate-100">
                                                <TableHead>Full Name</TableHead>
                                                <TableHead>Username</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>WBP ID</TableHead>
                                                <TableHead>Phone Number</TableHead>
                                                <TableHead>PS Name</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                                            <Loader className="animate-spin" />
                                                            Loading users...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {!loading && error && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-red-500">
                                                        Error: {error}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {!loading && !error && currentUsers.length > 0 &&
                                                currentUsers.map((user, index) => (
                                                    <TableRow key={user.UserName || index}>
                                                        <TableCell className="whitespace-nowrap">{user.UserFullName}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{user.UserName}</TableCell>
                                                        <TableCell className="truncate max-w-xs">{user.EmailId}</TableCell>
                                                        <TableCell>{user.WbpId}</TableCell>
                                                        <TableCell>{user.phoneNumber}</TableCell>
                                                        <TableCell className="truncate max-w-xs">{user.PsName}</TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                            {!loading && !error && currentUsers.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        No police station users found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                    <div className="p-4">
                                        <SmartPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div >
    );
};

export default PsUsersTable;
