"use client";
import { useGetAuthUserQuery } from "@/state/api";
import { useParams } from "next/navigation";
import ImagePreviews from "./ImagePreviews";
import PropertyOverview from "./PropertyOverview";
import PropertyDetails from "./PropertyDetails";
import PropertyLocation from "./PropertyLocation";
import ContactWidget from "./ContactWidget";
import ApplicationModal from "./ApplicationModal";

const SingleListing = () => {
  const { id } = useParams();
  const propertyId = Number(id);
  const { data: authUser } = useGetAuthUserQuery();

  return (
    <div>
      <ImagePreviews
        images={["/singlelisting-2.jpg", "/singlelisting-3.jpg"]}
      />
      <div className="flex flex-col md:flex-grow justify-center gap-10 mx-10 md:w-2/3 md:mx-auto mt-16 mb-8">
        <div className="order-2 md:order-1">
          <PropertyOverview propertyId={propertyId} />
          <PropertyDetails />
          <PropertyLocation />
        </div>
        <div className="order-1 md:order-2">
          <ContactWidget />
        </div>
      </div>
      {authUser && <ApplicationModal />}
    </div>
  );
};

export default SingleListing;
