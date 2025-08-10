"use client";

import Header from "@/components/Header";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";

// import dynamic from "next/dynamic";
// const CustomFormField = dynamic(
//   () => import("@/components/FormField").then((mod) => mod.CustomFormField),
//   { ssr: false }
// );

const NewProperty = () => {
  const [createProperty] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery();

  // const form = useForm<PropertyFormData>({
  //   resolver: zodResolver(propertySchema),
  //   defaultValues: {
  //     name: "",
  //     description: "",
  //     pricePerMonth: 1000,
  //     securityDeposit: 500,
  //     applicationFee: 100,
  //     isPetsAllowed: true,
  //     isParkingIncluded: true,
  //     photoUrls: [],
  //     amenities: "",
  //     highlights: "",
  //     beds: 1,
  //     baths: 1,
  //     squareFeet: 1000,
  //     // propertyType: ''
  //     address: "",
  //     city: "",
  //     state: "",
  //     country: "",
  //     postalCode: "",
  //   },
  // });

  // const onSubmit = async (data: PropertyFormData) => {
  //   if (!authUser?.cognitoInfo?.userId) {
  //     throw new Error("No manager ID found");
  //   }

  //   const formData = new FormData();
  //   Object.entries(data).forEach(([key, value]) => {
  //     if (key === "photoUrls" && typeof window !== "undefined") {
  //       const files = value as any[];
  //       files.forEach((file) => {
  //         formData.append("photos", file);
  //       });
  //     } else if (Array.isArray(value)) {
  //       // which field is array?
  //       formData.append(key, JSON.stringify(value));
  //     } else {
  //       formData.append(key, String(value));
  //     }
  //   });
  //   formData.append("managerCognitoId", authUser.cognitoInfo.userId);
  //   await createProperty(formData);
  // };
  return (
    <div className="dashboard-container">
      <Header
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />
      <div className="bg-white rounded-xl p-6">Form</div>
    </div>
  );
};

export default NewProperty;
