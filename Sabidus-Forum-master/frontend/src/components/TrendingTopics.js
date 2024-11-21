import React from 'react';

const TrendingTopics = () => {
  const trendingTopics = [
    { id: 1, name: 'Inteligência Artificial' },
    { id: 2, name: 'Sustentabilidade' },
    { id: 3, name: 'Tecnologia 5G' },
    { id: 4, name: 'Criptomoedas' },
    { id: 5, name: 'Educação Online' },
  ];

  return (
    <div className="sidebar-card">
      <ul className="list-group list-group-flush">
        {trendingTopics.map(topic => (
          <li key={topic.id} className="list-group-item">
            <div className="trending-topic">
              <div className="trending-icon">#{topic.id}</div>
              <span>{topic.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingTopics;
