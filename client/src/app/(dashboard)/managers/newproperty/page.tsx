"use client";

import Header from "@/components/Header";

import dynamic from "next/dynamic";
const PropertyForm = dynamic(() => import("./PropertyForm"), { ssr: false });

const NewProperty = () => {
  return (
    <div className="dashboard-container">
      <Header
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />
      <div className="bg-white rounded-xl p-6">
        <PropertyForm />
      </div>
    </div>
  );
};

export default NewProperty;
