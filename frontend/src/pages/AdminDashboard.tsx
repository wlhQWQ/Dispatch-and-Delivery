import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- 类型定义 ---
interface Robot {
  id?: string;
  hub_id: string;
  type: string;
  available: boolean;
  battery: number;
  position?: [number, number]; // 坐标
  max_weight: number;
  speed: number;
  price: number;
}

interface AddRobotRequest {
  hub_id: string;
  type: string;
  available: boolean;
  battery: number;
  max_weight: number;
  speed: number;
  price: number;
}

// --- Mock 数据 (带坐标) ---
const MOCK_ROBOTS: Robot[] = [
  { 
    id: '1', hub_id: 'hub_001', type: 'Robot', available: true, battery: 90, 
    max_weight: 5, speed: 60, price: 10, position: [47.60, -122.33] 
  },
  { 
    id: '2', hub_id: 'hub_001', type: 'Robot', available: false, battery: 45, 
    max_weight: 10, speed: 20, price: 5, position: [47.61, -122.34] 
  },
  { 
    id: '3', hub_id: 'hub_002', type: 'Robot', available: true, battery: 100, 
    max_weight: 8, speed: 55, price: 12, position: [47.62, -122.35] 
  },
];

const AdminDashboard: React.FC = () => {
  // 1. Hooks 初始化
  const navigate = useNavigate();
  const location = useLocation();

  // 2. State 状态管理
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHub, setSearchHub] = useState('');
  
  const initialFormState: AddRobotRequest = {
    hub_id: 'hub_001',
    type: 'Robot',
    available: true,
    battery: 100,
    max_weight: 5.0,
    speed: 10.0,
    price: 2.0
  };
  const [formData, setFormData] = useState<AddRobotRequest>(initialFormState);

  // 3. 核心功能函数
  const fetchRobots = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        if (searchHub.trim() === '') {
          setRobots(MOCK_ROBOTS);
        } else {
          const filtered = MOCK_ROBOTS.filter(r => r.hub_id.includes(searchHub));
          setRobots(filtered);
        }
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error("Failed to fetch robots", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ['battery', 'max_weight', 'speed', 'price'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: isNumber ? parseFloat(value) : value
    }));
  };

  const handleAddRobot = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRobotMock = { ...formData, id: Date.now().toString(), position: [47.60, -122.33] as [number, number] };
    setRobots([...robots, newRobotMock]);
    alert('Robot Added Successfully (Mock)!');
  };

  // ✅ 唯一的支付跳转函数
  const handleMockPayment = () => {
    navigate('/mock-stripe');
  };

  // 4. Effects (副作用)
  useEffect(() => {
    fetchRobots();
  }, [searchHub]);

  // 监听支付成功回调
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment_status') === 'success') {
      // 为了用户体验，稍微延迟一点弹窗，让页面先渲染出来
      setTimeout(() => {
          alert("✅ Payment Confirmed by 'Stripe'!"); 
      }, 500);
      
      // 清除 URL 参数
      window.history.replaceState({}, '', '/admin');
    }
  }, [location]);

  // 5. 视图渲染 (UI)
  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button 
            onClick={handleMockPayment}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
        >
            💳 Test Stripe Payment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 左侧: 添加机器人表单 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            ➕ Add New Robot
          </h2>
          <form onSubmit={handleAddRobot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hub ID</label>
              <input 
                name="hub_id" 
                value={formData.hub_id} 
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleInputChange}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Robot">Robot 🤖</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Weight (kg)</label>
                <input type="number" name="max_weight" value={formData.max_weight} onChange={handleInputChange} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Speed (km/h)</label>
                <input type="number" name="speed" value={formData.speed} onChange={handleInputChange} className="w-full border p-2 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Battery (%)</label>
                  <input type="number" name="battery" value={formData.battery} onChange={handleInputChange} className="w-full border p-2 rounded-lg" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Price ($/km)</label>
                  <input type="number" step="0.1" name="price" value={formData.price} onChange={handleInputChange} className="w-full border p-2 rounded-lg" />
               </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-4 shadow-md"
            >
              Confirm Add
            </button>
          </form>
        </div>

        {/* 右侧: 机器人列表 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-700">📡 Fleet Status</h2>
            
            {/* 搜索框 */}
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Filter by Hub ID..." 
                    value={searchHub}
                    onChange={(e) => setSearchHub(e.target.value)}
                    className="pl-3 pr-8 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-2 top-1.5 text-gray-400 text-xs">🔍</span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading data...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID / Hub</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loc</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Battery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {robots.map((robot) => (
                    <tr key={robot.id || Math.random()} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{robot.id}</div>
                        <div className="text-xs text-gray-500">{robot.hub_id}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {robot.type === 'Drone' ? '🚁' : '🤖'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                         {robot.position ? `[${robot.position[0]}, ${robot.position[1]}]` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${robot.battery > 20 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm text-gray-700">{robot.battery}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          robot.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {robot.available ? 'Available' : 'Busy'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {robots.length === 0 && (
                      <tr>
                          <td colSpan={5} className="text-center py-4 text-gray-400 text-sm">No robots found for this Hub.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;