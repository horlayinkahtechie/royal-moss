import Hero from "@/app/_components/Hero";
import RoomAvailability from "@/app/_components/RoomAvailability";
import FeaturedRoomsCategory from "@/app/_components/FeaturedRoomsCategory";
import FeaturedRooms from "@/app/_components/FeaturedRooms";
import Amenities from "@/app/_components/Amenities";
import WhyChooseUs from "@/app/_components/WhyChooseUs";
import Testimonials from "@/app/_components/Testimonials";
import ContactSection from "@/app/_components/ContactSection";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero />
      <RoomAvailability />
      <FeaturedRoomsCategory />
      <FeaturedRooms />
      <Amenities />
      <WhyChooseUs />
      <Testimonials />
      <ContactSection />
    </div>
  );
}
