import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MenuCategory } from '../../types';
import { useCartContext } from '../../context/CartContext';
import { menuApi } from '../../api/menuApi';
import './CustomerMenu.css';

export default function CustomerMenu() {
  const { storeId } = useParams();
  const { addItem, items } = useCartContext();
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!storeId) return;
    menuApi.fetchMenu(storeId)
      .then((menuData) => {
        setMenu(menuData);
        if (menuData.length > 0) {
          setActiveCategory(menuData[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load menu:', err);
        setLoading(false);
      });
  }, [storeId]);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const el = sectionRefs.current[categoryId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddToCart = (item: MenuCategory['items'][0]) => {
    addItem({
      menuItemId: item.id,
      menuItemName: item.name,
      unitPrice: item.price,
    });
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 600);
  };

  const getItemQuantity = (menuItemId: string) => {
    const cartItem = items.find(i => i.menuItemId === menuItemId);
    return cartItem?.quantity || 0;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  if (loading) {
    return <div className="loading">메뉴를 불러오는 중...</div>;
  }

  return (
    <div className="menu-page">
      {/* 카테고리 탭 */}
      <div className="category-tabs" role="tablist" aria-label="메뉴 카테고리">
        {menu.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => scrollToCategory(category.id)}
            role="tab"
            aria-selected={activeCategory === category.id}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 메뉴 목록 */}
      <div className="menu-list">
        {menu.map(category => (
          <div
            key={category.id}
            ref={el => { sectionRefs.current[category.id] = el; }}
            className="menu-section"
          >
            <h2 className="section-title">{category.name}</h2>
            <div className="menu-grid">
              {category.items.map(item => (
                <div
                  key={item.id}
                  className={`menu-card ${addedItemId === item.id ? 'added' : ''}`}
                >
                  <div className="menu-card-image">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = 'none';
                          el.parentElement?.classList.add('no-image');
                        }}
                      />
                    ) : null}
                    <span className="menu-card-placeholder" aria-hidden="true">🍽️</span>
                  </div>
                  <div className="menu-card-body">
                    <h3 className="menu-card-name">{item.name}</h3>
                    {item.description && (
                      <p className="menu-card-desc">{item.description}</p>
                    )}
                    <div className="menu-card-footer">
                      <span className="menu-card-price">{formatPrice(item.price)}</span>
                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(item)}
                        aria-label={`${item.name} 장바구니에 추가`}
                        data-testid={`add-${item.id}`}
                      >
                        {getItemQuantity(item.id) > 0 ? (
                          <span className="qty-badge">{getItemQuantity(item.id)}</span>
                        ) : (
                          '+'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
