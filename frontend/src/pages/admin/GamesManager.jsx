import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import gameService from '../../services/gameService';
import { useTherapyStore } from '../../hooks/useTherapyStore';

const getActivitiesCount = (game) =>
  Array.isArray(game?.config?.levels)
    ? game.config.levels.reduce(
        (total, level) => total + (Array.isArray(level.activities) ? level.activities.length : 0),
        0
      )
    : 0;

const getDisplayName = (game) => game?.config?.nameAr || game?.titleAr || game?.title || game?.name;

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase();

const GamesManager = () => {
  const navigate = useNavigate();
  const { adminSession } = useTherapyStore();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gameService.getGames(adminSession?.token);
        setGames(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [adminSession?.token]);

  const filteredGames = useMemo(() => {
    const query = normalizeSearchValue(searchTerm);

    if (!query) {
      return games;
    }

    return games.filter((game) =>
      [
        game?.gameCode,
        getDisplayName(game),
        game?.type,
        game?.title,
        game?.name,
      ].some((value) => normalizeSearchValue(value).includes(query))
    );
  }, [games, searchTerm]);

  const handleDelete = async (gameId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه اللعبة؟')) {
      return;
    }

    try {
      await gameService.deleteGame(adminSession?.token, gameId);
      setGames((current) => current.filter((game) => game.id !== gameId));
    } catch (error) {
      console.error('Error deleting game:', error);
      window.alert('حدث خطأ أثناء حذف اللعبة.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xl font-bold text-slate-700">جارٍ تحميل الألعاب...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة الألعاب</h2>
          <p className="text-slate-500 mt-2">ابحث بالكود أو اسم اللعبة أو نوعها لتنظيم مكتبة الألعاب.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 xl:min-w-[34rem]">
          <label className="relative flex-1">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-[#dbe7f3] bg-white pr-11 pl-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="ابحث بكود اللعبة أو الاسم أو النوع"
            />
          </label>

          <Button
            variant="primary"
            onClick={() => navigate('/admin/games/create')}
            className="w-full sm:w-auto !py-3 !px-5"
          >
            <Plus size={20} />
            <span>لعبة جديدة</span>
          </Button>
        </div>
      </div>

      <div className="rounded-[1.8rem] border border-[#dbe7f3] bg-[#f8fbff] px-5 py-4 text-sm text-slate-600">
        <span className="font-black text-slate-900">{filteredGames.length}</span>
        <span> لعبة ظاهرة في النتائج الحالية.</span>
      </div>

      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-600">اسم اللعبة</th>
              <th className="px-6 py-4 font-bold text-gray-600">كود اللعبة</th>
              <th className="px-6 py-4 font-bold text-gray-600">النوع</th>
              <th className="px-6 py-4 font-bold text-gray-600">عدد الأنشطة</th>
              <th className="px-6 py-4 font-bold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredGames.map((game) => (
              <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{getDisplayName(game)}</div>
                  <div className="text-sm text-gray-500" dir="ltr">
                    {game.title || game.name || '--'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 font-bold text-blue-700" dir="ltr">
                    {game.gameCode || '--'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{game.type}</td>
                <td className="px-6 py-4 text-gray-600">{getActivitiesCount(game)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/games/edit/${game.id}`)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="تعديل اللعبة"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="حذف اللعبة"
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

      <div className="grid md:hidden gap-4">
        {filteredGames.map((game) => (
          <article
            key={game.id}
            className="bg-white rounded-[1.8rem] border border-[#dbe7f3] shadow-sm p-5 space-y-4"
          >
            <div>
              <div className="text-xl font-black text-slate-900 leading-8">{getDisplayName(game)}</div>
              <div className="text-sm text-slate-500 mt-2" dir="ltr">
                {game.gameCode || '--'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f8fbff] border border-[#dbe7f3] px-4 py-3">
                <div className="text-xs font-bold text-slate-500 mb-1">النوع</div>
                <div className="text-sm font-black text-slate-800 break-all">{game.type}</div>
              </div>
              <div className="rounded-2xl bg-[#f8fbff] border border-[#dbe7f3] px-4 py-3">
                <div className="text-xs font-bold text-slate-500 mb-1">عدد الأنشطة</div>
                <div className="text-lg font-black text-slate-800">{getActivitiesCount(game)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full justify-center !py-3"
                onClick={() => navigate(`/admin/games/edit/${game.id}`)}
              >
                <Edit2 size={18} />
                <span>تعديل</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center !py-3 bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                onClick={() => handleDelete(game.id)}
              >
                <Trash2 size={18} />
                <span>حذف</span>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default GamesManager;
