import Hero from "@/app/_components/Hero";
import RoomAvailability from "@/app/_components/RoomAvailability";
import FeaturedRooms from "@/app/_components/FeaturedRooms";
import Amenities from "@/app/_components/Amenities";
import WhyChooseUs from "@/app/_components/WhyChooseUs";
import Testimonials from "@/app/_components/Testimonials";
import CallToAction from "@/app/_components/CallToAction";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero />
      <RoomAvailability />
      <FeaturedRooms />
      <Amenities />
      <WhyChooseUs />
      <Testimonials />
      {/* <CallToAction /> */}
    </div>
  );
}
