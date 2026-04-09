import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Staff, Terminal } from "@/types";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: any) => void;
  staff?: Staff | null;
  terminals: Terminal[];
}

export default function StaffModal({
  isOpen,
  onClose,
  onSave,
  staff,
  terminals,
}: StaffModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    code: "",
    position: "",
    terminalID: "",
    status: "Active" as "Active" | "Inactive",
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        email: staff.email || "",
        code: staff.code || "",
        position: staff.position || "",
        terminalID: staff.terminalID || "",
        status: staff.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        code: "",
        position: "",
        terminalID: "",
        status: "Active",
      });
    }
  }, [staff, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02404F] sm:ml-3 sm:w-auto sm:text-sm"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="staffForm"
        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#02404F] text-base font-medium text-white hover:bg-[#036b82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02404F] sm:ml-3 sm:w-auto sm:text-sm"
      >
        {staff ? "Update" : "Save"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staff ? "Edit Staff" : "Add Staff"}
      footer={footer}
    >
      <form id="staffForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            Access Code
          </label>
          <input
            type="text"
            name="code"
            id="code"
            required
            value={formData.code}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="position"
            className="block text-sm font-medium text-gray-700"
          >
            Position
          </label>
          <input
            type="text"
            name="position"
            id="position"
            required
            value={formData.position}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="terminalID"
            className="block text-sm font-medium text-gray-700"
          >
            Terminal
          </label>
          <select
            name="terminalID"
            id="terminalID"
            required
            value={formData.terminalID}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
          >
            <option value="">Select Terminal</option>
            {terminals.map((terminal) => (
              <option key={terminal.id} value={terminal.id}>
                {terminal.name}
              </option>
            ))}
          </select>
        </div>

        {staff && (
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02404F] focus:border-[#02404F] sm:text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
}
