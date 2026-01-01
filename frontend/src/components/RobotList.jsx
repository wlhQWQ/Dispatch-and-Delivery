import { useState } from "react";
import { ChevronDown, ChevronUp, Plane, Bot, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { DialogTrigger } from "@radix-ui/react-dialog";

const mockRobots = [
  {
    robot_id: "1",
    status: "available",
    battery: 85,
    hub_id: "1",
    speed: 40,
    price: 5,
    type: "drone",
  },
  {
    robot_id: "2",
    status: "in-use",
    battery: 23,
    hub_id: "2",
    speed: 45,
    price: 4,
    type: "robot",
  },
  {
    robot_id: "3",
    status: "available",
    battery: 92,
    hub_id: "1",
    speed: 55,
    price: 6,
    type: "drone",
  },
  {
    robot_id: "4",
    status: "in-use",
    battery: 67,
    hub_id: "2",
    speed: 48,
    price: 4.5,
    type: "drone",
  },
];

function RobotCard({ robot }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = robot.type === "drone" ? Plane : Bot;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Robot Header */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        className="w-full p-4 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-700" />
          <span className="text-gray-900 font-medium">
            Robot #{robot.robot_id}
          </span>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </Button>

      {/* Robot Details (Expanded) */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <table className="w-full mt-4">
            <tbody>
              <tr className="border-b">
                <td className="py-2 text-sm text-gray-500">Robot ID</td>
                <td className="py-2 text-sm text-gray-900 text-right">
                  {robot.robot_id}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-sm text-gray-500">Hub ID</td>
                <td className="py-2 text-sm text-gray-900 text-right">
                  {robot.hub_id}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-sm text-gray-500">Status</td>
                <td className="py-2 text-sm text-gray-900 text-right capitalize">
                  {robot.status}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-sm text-gray-500">Battery</td>
                <td className="py-2 text-sm text-gray-900 text-right">
                  {robot.battery}%
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-sm text-gray-500">Max Weight</td>
                <td className="py-2 text-sm text-gray-900 text-right">
                  {robot.max_weight} kg
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 text-sm text-gray-500">Speed</td>
                <td className="py-2 text-sm text-gray-900 text-right">
                  {robot.speed} km/h
                </td>
              </tr>
              <tr>
                <td className="py-2 text-sm text-gray-500">Price</td>
                <td className="py-2 text-sm text-gray-900 text-right">
                  ${robot.price} per km
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function RobotList() {
  const [robots, setRobots] = useState(mockRobots);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    robot_id: "",
    status: "available",
    battery: 100,
    hub_id: "",
    speed: "",
    price: "",
    type: "drone",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRobot = (e) => {
    const newRobot = {
      ...formData,
      battery: parseInt(formData.battery),
    };
    setRobots([...robots, newRobot]);
    // Reset form
    setFormData({
      robot_id: 0,
      status: "available",
      battery: 100,
      max_weight: 0,
      hub_id: 0,
      speed: 0,
      price: 0,
      type: "robot",
    });
    setDialogOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 添加机器人按钮和弹窗表格*/}
      <div className="mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Robot
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Robot</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddRobot} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">
                    Robot ID
                  </label>
                  <input
                    type="number"
                    name="robot_id"
                    value={formData.robot_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">
                    Hub ID
                  </label>
                  <input
                    type="number"
                    name="hub_id"
                    value={formData.hub_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <input
                    type="text"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    defaultValue={"available"}
                    placeholder={"available"}
                  />
                </div>
                <div className="w-1/4">
                  <label className="block text-sm font-medium mb-1">
                    Battery
                  </label>
                  <input
                    type="number"
                    name="battery"
                    value={formData.battery}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    defaultValue={100}
                    placeholder={100}
                  />
                </div>
                <div className="w-1/4">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    defaultValue={"robot"}
                    placeholder={"robot"}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">
                    Speed
                  </label>
                  <input
                    type="number"
                    name="speed"
                    value={formData.speed}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    defaultValue={0}
                    placeholder={0}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">
                    price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    defaultValue={0}
                    placeholder={0}
                  />
                </div>
              </div>
              <div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className=" w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    Confirm Add Robot
                  </Button>
                  <Button
                    onClick={() => setDialogOpen(false)}
                    className=" w-auto px-4 py-2 bg-white text-black rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    cancel
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 机器人列表 */}
      <div className="space-y-4">
        {robots.map((robot) => (
          <RobotCard key={robot.robot_id} robot={robot} />
        ))}
      </div>
    </div>
  );
}
