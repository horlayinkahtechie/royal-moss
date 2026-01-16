import Bookroom from "./bookroom";

export const metadata = {
  title: "Book Room | Admin – Royal Moss Hotel",
  description:
    "Admin booking interface for creating room reservations at Royal Moss Hotel. Restricted access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Bookroom />
    </div>
  );
}
