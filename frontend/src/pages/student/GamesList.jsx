import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from '../../components/GameCard';

const GamesList = () => {
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

  if (loading) {
    return <div className="text-center py-20 text-2xl font-bold text-slate-700">جاري تحميل الألعاب...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 mb-4 drop-shadow-sm">اختار اللعبة اللي تحبها</h2>
        <p className="text-xl text-slate-600 font-bold">عندنا العاب كتير ممتعة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GamesList;
