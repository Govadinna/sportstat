import React, { useState, useEffect } from 'react';
import './App.css';




function App() {
  const [blocks, setBlocks] = useState(() => {
    const savedBlocks = localStorage.getItem('blocks');
    return savedBlocks ? JSON.parse(savedBlocks) : [];
  });

  useEffect(() => {
    localStorage.setItem('blocks', JSON.stringify(blocks));
  }, [blocks]);

  const addBlock = () => {
    setBlocks([...blocks, { id: Date.now(), name: 'День', categories: [] }]);
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  const handleBlockNameChange = (blockId, newName) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, name: newName } : block
      )
    );
  };

  const [hideButtons, setHideButtons] = useState(true);


  const exportSettings = () => {
    const dataStr = JSON.stringify(blocks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "settings.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedBlocks = JSON.parse(e.target.result);
          setBlocks(importedBlocks);
        } catch (error) {
          alert("Ошибка при импорте данных. Проверьте файл.");
        }
      };
      reader.readAsText(file);
    }
  };      

  const startTimer = (blockId, categoryId) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            categories: block.categories.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    timerRunning: true,
                    remainingTime: parseInt(category.timer) * 60 || 0,
                  }
                : category
            ),
          };
        }
        return block;
      })
    );
  
    const interval = setInterval(() => {
      setBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.id === blockId) {
            return {
              ...block,
              categories: block.categories.map((category) => {
                if (category.id === categoryId) {
                  if (category.remainingTime > 0) {
                    const minutes = Math.floor(category.remainingTime / 60);
                    const seconds = category.remainingTime % 60;
                    return {
                      ...category,
                      remainingTime: category.remainingTime - 1,
                      timer: `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`, // Обновляем поле `timer`
                    };
                  } else {
                    clearInterval(interval);
                    return {
                      ...category,
                      timerRunning: false,
                      timer: '', // Сбрасываем поле `timer` после завершения
                    };
                  }
                }
                return category;
              }),
            };
          }
          return block;
        });
  
        return updatedBlocks;
      });
    }, 1000);
  };
  


const stopTimer = (blockId, categoryId) => {
  setBlocks((prevBlocks) =>
    prevBlocks.map((block) => {
      if (block.id === blockId) {
        return {
          ...block,
          categories: block.categories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  timerRunning: false, // Сбрасываем состояние запуска
                  remainingTime: 0,    // Обнуляем оставшееся время
                  timer: '',   // Остановить таймер
                }
              : category
          ),
        };
      }
      return block;
    })
  );
};

const toggleTimer = (blockId, categoryId) => {
  const targetBlock = blocks.find((block) => block.id === blockId);
  const targetCategory = targetBlock.categories.find((cat) => cat.id === categoryId);

  if (targetCategory.timerRunning) {
    stopTimer(blockId, categoryId); // Останавливаем таймер
  } else {
    startTimer(blockId, categoryId); // Запускаем таймер
  }
};

  

      


  const addCategory = (blockId, parentCategoryId = null) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === blockId) {
          if (parentCategoryId === null) {
            return {
              ...block,
              categories: [
                ...block.categories,
                { id: Date.now(), name: '', value: 0, extraValue: 0, subCategories: [], isCollapsed: false },
              ],
            };
          } else {
            return {
              ...block,
              categories: block.categories.map((category) =>
                category.id === parentCategoryId
                  ? {
                      ...category,
                      subCategories: [
                        ...category.subCategories,
                        { id: Date.now(), name: '', value: 0, extraValue: 0 },
                      ],
                    }
                  : category
              ),
            };
          }
        }
        return block;
      })
    );
  };

  const deleteCategory = (blockId, categoryId, parentCategoryId = null) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === blockId) {
          if (parentCategoryId === null) {
            return {
              ...block,
              categories: block.categories.filter((cat) => cat.id !== categoryId),
            };
          } else {
            return {
              ...block,
              categories: block.categories.map((category) =>
                category.id === parentCategoryId
                  ? {
                      ...category,
                      subCategories: category.subCategories.filter(
                        (subCat) => subCat.id !== categoryId
                      ),
                    }
                  : category
              ),
            };
          }
        }
        return block;
      })
    );
  };

  const deleteSubCategory = (blockId, categoryId, subCategoryId) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            categories: block.categories.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    subCategories: category.subCategories.filter(
                      (subCat) => subCat.id !== subCategoryId
                    ),
                  }
                : category
            ),
          };
        }
        return block;
      })
    );
  };
  

  const handleInputChange = (blockId, categoryId, field, value, parentCategoryId = null) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === blockId) {
          if (parentCategoryId === null) {
            return {
              ...block,
              categories: block.categories.map((cat) =>
                cat.id === categoryId ? { ...cat, [field]: value } : cat
              ),
            };
          } else {
            return {
              ...block,
              categories: block.categories.map((category) =>
                category.id === parentCategoryId
                  ? {
                      ...category,
                      subCategories: category.subCategories.map((subCat) =>
                        subCat.id === categoryId ? { ...subCat, [field]: value } : subCat
                      ),
                    }
                  : category
              ),
            };
          }
        }
        return block;
      })
    );
  };

  const toggleCollapse = (blockId, categoryId) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            categories: block.categories.map((cat) =>
              cat.id === categoryId
                ? { ...cat, isCollapsed: !cat.isCollapsed }
                : cat
            ),
          };
        }
        return block;
      })
    );
  };

  return (
    <div className="App">
      <button className='edit' onClick={() => setHideButtons((prev) => !prev)}>
            {hideButtons ? "Изм." : "Готово"}
          </button>

          {!hideButtons && (
            <button onClick={addBlock} className="add-block">Добавить блок</button>
          )}
      {blocks.map((block) => (
        <div key={block.id} className="block">
          <input
            type="text"
            value={block.name}
            onChange={(e) => handleBlockNameChange(block.id, e.target.value)}
          />
          
          
          {!hideButtons && (
          <button onClick={() => addCategory(block.id)}>+Категория</button>
          )}
          

          <div className="categories">
            {block.categories.map((cat, index) => (
              <div key={cat.id} className="category">
                <button onClick={() => toggleCollapse(block.id, cat.id)}>
                  {cat.isCollapsed ? '+' : '-'}
                </button>
                <span className='padding'>{index + 1}.</span>
                <input
                  type="text"
                  value={cat.name}
                  placeholder="Категория"
                  className='excercice-input'
                  onChange={(e) =>
                    handleInputChange(block.id, cat.id, 'name', e.target.value)
                  }
                />
                <input
                  type="number"
                  className='input-cat'
                  value={cat.value}
                  onChange={(e) =>
                    handleInputChange(block.id, cat.id, 'value', parseInt(e.target.value))
                  }
                />
                <input
                  type="number"
                  className='input-cat'
                  value={cat.extraValue}
                  onChange={(e) =>
                    handleInputChange(block.id, cat.id, 'extraValue', parseInt(e.target.value))
                  }
                />
                
                <input
              type="text"
              className='input-time'
              placeholder="Мин."
              value={cat.timer || ''}
              onChange={(e) =>
                handleInputChange(block.id, cat.id, 'timer', e.target.value)
              }
              disabled={cat.timerRunning} // Блокируем поле ввода, если таймер запущен
            />
            
            <button
              onClick={() => toggleTimer(block.id, cat.id)}
            >
              {cat.timerRunning ? "Сброс" : "Старт"}
            </button>


           

                        


                {!hideButtons && (
                <button onClick={() => deleteCategory(block.id, cat.id)}>-</button>
                )}
                {!cat.isCollapsed && (
                  <div className="sub-categories">
                    {cat.subCategories.map((subCat, subIndex) => (
                      <div key={subCat.id} className="sub-category">
                        <span>{subIndex + 1}</span>
                        
                        <input
                          type="number"
                          className='input'
                          value={subCat.value}
                          onChange={(e) =>
                            handleInputChange(
                              block.id,
                              subCat.id,
                              'value',
                              parseInt(e.target.value),
                              cat.id
                            )
                          }
                        />
                        <input
                          type="number"
                          className='input'
                          value={subCat.extraValue}
                          onChange={(e) =>
                            handleInputChange(
                              block.id,
                              subCat.id,
                              'extraValue',
                              parseInt(e.target.value),
                              cat.id
                            )
                          }
                        />
                        {!hideButtons && (
                        <button onClick={() => deleteSubCategory(block.id, cat.id,subCat.id)}>-</button>
                        )}
                        
                      </div>
                    ))}
                    {!hideButtons && (
                    <button onClick={() => addCategory(block.id, cat.id)}>
                  +Подход
                </button>
                  )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!hideButtons && (
          <button className="delete-block" onClick={() => deleteBlock(block.id)}>
            Удалить блок
          </button>
          )}
        </div>
        
      ))}
        <div>
  <button onClick={exportSettings}>Экспортировать настройки</button>
  <input
    type="file"
    accept=".json"
    onChange={importSettings}
    style={{ marginLeft: "10px" }}
  />
</div>

    </div>
  );
}

export default App;
