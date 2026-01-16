import Bookings from "./bookings";

export const metadata = {
  title: "My Bookings | Royal Moss Hotel",
  description: "View and manage your hotel bookings at Royal Moss Hotel.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div>
      <Bookings />
    </div>
  );
}
