"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const contents: { imageSrc: string; title: string; description: string }[] = [
  {
    imageSrc: "/landing-icon-wand.png",
    title: "Search for Properties",
    description:
      "Browse through our extensive collection of rental properties in your desired location.",
  },
  {
    imageSrc: "/landing-icon-calendar.png",
    title: "Book Your Rental",
    description:
      "Once you've found the perfect rental property, easily book it online with just a few clicks.",
  },
  {
    imageSrc: "/landing-icon-heart.png",
    title: "Enjoy Your New Home",
    description:
      "Move into your new rental property and start enjoying your dream home.",
  },
];

const DiscoverSection = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      variants={containerVariants}
      className="py-12 mb-16 bg-white"
    >
      <div className="max-w-6xl xl:mx-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div variants={itemVariants} className="my-12 text-center">
          <h2 className="text-3xl font-semibold leading-tight text-gray-800">
            Discover
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Find Your Dream Rental Property Today!
          </p>
          <p className="mt-2 text-gray-500 max-w-3xl mx-auto">
            Searching for your dream rental property has never been easier. With
            our user-friendly search feature, you can quickly find the perfect
            home that meets all your needs. Start your search today and discover
            your dream rental property!
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 text-center">
          {contents.map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <DiscoverCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface CardProps {
  imageSrc: string;
  title: string;
  description: string;
}

const DiscoverCard = ({ imageSrc, title, description }: CardProps) => {
  return (
    <div className="px-4 py-12 shadow-lg rounded-lg bg-primary-50 md:h-72">
      <div className="bg-primary-700 rounded-full mb-4 h-10 w-10 mx-auto p-[0.6rem]">
        <Image src={imageSrc} alt={title} width={30} height={30} className="" />
      </div>
      <h3 className="tmt-4 text-xl font-medium text-gray-800">{title}</h3>
      <p className="mb-2 text-base text-gray-500">{description}</p>
    </div>
  );
};

export default DiscoverSection;
