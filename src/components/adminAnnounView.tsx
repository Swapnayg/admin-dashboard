import { getAnnouncements } from "@/lib/actions";
import { Megaphone, CalendarCheck } from "lucide-react";
import Link from "next/link";

const getTypeStyles = (type: string) => {
  if (type === "EXAM_RESULT") {
    return {
      icon: <CalendarCheck className="text-purple-600" size={20} />,
      bg: "bg-gradient-to-r from-purple-100 to-purple-200",
      border: "border-purple-300",
    };
  }
  return {
    icon: <Megaphone className="text-amber-500" size={20} />,
    bg: "bg-gradient-to-r from-yellow-100 to-yellow-200",
    border: "border-yellow-300",
  };
};

const AdminAnnounView = async () => {
  const annoucements = await getAnnouncements();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
    <h1 className="text-lg sm:text-xl font-semibold text-gray-800">📢 Announcements</h1>
    <Link href="/list/studentAnnoucement">
      <span className="text-sm text-indigo-600 cursor-pointer hover:underline">
        View All
      </span>
    </Link>
  </div>

  <div className="flex flex-col gap-4">
    {annoucements.length === 0 ? (
      <p className="text-sm text-gray-500">No announcements available.</p>
    ) : (
      annoucements.map((announcement) => {
        const { icon, bg, border } = getTypeStyles(announcement.announcementType);

        return (
          <div
            key={announcement.id}
            className={`rounded-lg p-4 ${bg} border ${border} shadow-sm hover:shadow transition-shadow`}
          >
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <div className="flex items-start gap-2">
                <div className="mt-1">{icon}</div>
                <h2 className="font-medium text-gray-800">{announcement.title}</h2>
              </div>
              <span className="text-xs text-gray-500 bg-white rounded px-2 py-1 shadow-sm self-start sm:self-center">
                {new Date(announcement.date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-2 line-clamp-3">
              {announcement.description}
            </p>
          </div>
        );
      })
    )}
  </div>
</div>

  );
};

export default AdminAnnounView;
