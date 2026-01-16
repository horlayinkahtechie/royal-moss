import Subscribers from "./subscribers";

export const metadata = {
  title: "Admin Subscribers – Hotel Management",
  description:
    "Admin page for managing newsletter subscribers of Royal Moss Hotel. Restricted access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Subscribers />
    </div>
  );
}
