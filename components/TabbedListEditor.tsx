
import React, { useRef } from 'react';
import PlusIcon from './icons/PlusIcon';
import DragHandleIcon from './icons/DragHandleIcon';

interface TabbedListEditorProps<T extends { id?: string }> {
  items: T[];
  onListChange: (newList: T[]) => void;
  getItemTitle: (item: T, index: number) => string;
  onAddItemTemplate: Omit<T, 'id'> | string;
  renderEditor: (item: T, index: number, onRemove: () => void) => React.ReactNode;
  entityName: string;
  reorderable?: boolean;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

const TabbedListEditor = <T extends { id?: string }>({
  items,
  onListChange,
  getItemTitle,
  onAddItemTemplate,
  renderEditor,
  entityName,
  reorderable = true,
  selectedIndex,
  onSelectIndex,
}: TabbedListEditorProps<T>) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  // Defensive check to ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  const handleAddItem = () => {
    const newList = [...safeItems];
    const newItem = typeof onAddItemTemplate === 'string' 
      ? onAddItemTemplate 
      : { ...onAddItemTemplate, id: `new_${Date.now()}` };
    newList.push(newItem as T);
    onListChange(newList);
    onSelectIndex(newList.length - 1);
  };

  const handleRemoveCurrentItem = () => {
    if (!window.confirm(`Are you sure you want to remove this ${entityName}?`)) return;
    const newList = [...safeItems];
    newList.splice(selectedIndex, 1);
    onListChange(newList);
    const newIndex = newList.length === 0 ? -1 : Math.min(selectedIndex, newList.length - 1);
    onSelectIndex(newIndex);
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        const newList = [...safeItems];
        const [draggedItem] = newList.splice(dragItem.current, 1);
        newList.splice(dragOverItem.current, 0, draggedItem);
        onListChange(newList);
        onSelectIndex(dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const selectedItem = selectedIndex >= 0 && selectedIndex < safeItems.length ? safeItems[selectedIndex] : null;

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="border-b flex items-center pr-2">
        <div className="flex-grow overflow-x-auto scrollbar-thin">
            <div className="flex items-center p-2 space-x-2">
            {safeItems.map((item, index) => (
                <button
                    key={item.id || index}
                    onClick={() => onSelectIndex(index)}
                    draggable={reorderable}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`flex-shrink-0 flex items-center whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedIndex === index
                        ? 'bg-brand-green-dark text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${reorderable ? 'cursor-grab' : ''}`}
                >
                    {reorderable && <DragHandleIcon className="w-4 h-4 mr-2 text-gray-400" />}
                    <span className="mr-2 font-semibold text-gray-400">{index + 1}.</span>
                    {getItemTitle(item, index)}
                </button>
            ))}
            </div>
        </div>
        <button
          onClick={handleAddItem}
          className="flex-shrink-0 flex items-center bg-blue-500 text-white font-bold py-2 px-3 text-sm rounded hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Add {entityName}
        </button>
      </div>

      {selectedItem ? (
        <div className="p-4 relative">
          {renderEditor(selectedItem, selectedIndex, handleRemoveCurrentItem)}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
            No items to display. Click "Add {entityName}" to get started.
        </div>
      )}
    </div>
  );
};

export default TabbedListEditor;