import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/Button';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const GamesManager = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/games');
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (loading) return <div className="p-8 text-center text-xl font-bold">جاري تحميل الألعاب...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-dark">إدارة الألعاب</h2>
        <Button variant="primary" onClick={() => navigate('/admin/games/create')} className="!py-2 !text-sm">
          <Plus size={20} />
          <span>لعبة جديدة</span>
        </Button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-600">اسم اللعبة</th>
              <th className="px-6 py-4 font-bold text-gray-600">النوع</th>
              <th className="px-6 py-4 font-bold text-gray-600">المستوى</th>
              <th className="px-6 py-4 font-bold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {games.map(game => (
              <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-dark">{game.titleAr}</div>
                  <div className="text-sm text-gray-500">{game.title}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{game.type}</td>
                <td className="px-6 py-4 text-gray-600">{game.level}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/admin/games/edit/${game.id}`)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('هل أنت متأكد من حذف هذه اللعبة؟')) {
                          try {
                            await axios.delete(`http://localhost:5000/api/games/${game.id}`);
                            setGames(games.filter(g => g.id !== game.id));
                          } catch (error) {
                            console.error('Error deleting game:', error);
                            alert('حدث خطأ أثناء الحذف');
                          }
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GamesManager;
