import Checkin from "./checkin";

export const metadata = {
  title: "Admin Quick Check-In – Hotel Management",
  description:
    "Admin quick check-in page for manually checking guests into rooms.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Checkin />
    </div>
  );
}
