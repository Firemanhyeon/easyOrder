import React from 'react';
import {
  Box, Paper, Typography, IconButton, CircularProgress, Button, Alert, Chip,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, FormControlLabel, Switch
} from '@mui/material';
import { MenuItem as MuiMenuItem } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { menuApi } from '../../api/menu';
import type { MenuItem as MenuItemType, MenuCategory } from '../../types/menu';

// dnd-kit
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MenuManagementPanel: React.FC<{ storeId: number }> = ({ storeId }) => {
  type CatKey = 'all' | number;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [categories, setCategories] = React.useState<MenuCategory[]>([]);
  const [items, setItems] = React.useState<MenuItemType[]>([]);
  const [selectedCat, setSelectedCat] = React.useState<CatKey>('all');
  const [q, setQ] = React.useState('');
  const [allItemsCache, setAllItemsCache] = React.useState<MenuItemType[]>([]);
  // 정렬 모드
  const [isSorting, setIsSorting] = React.useState(false);
  const [sortIds, setSortIds] = React.useState<string[]>([]); // 정렬 모드일 때 화면에 표시할 순서(문자열 id 배열)

  // --- Add Menu Dialog state ---
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState<{
    
    category_id: number | '';
    name: string;
    price: string;
    description: string;
    imageFile: File | null;
    imagePreviewUrl: string | null;
  }>({
    category_id: '',
    name: '',
    price: '',
    description: '',
    imageFile: null,
    imagePreviewUrl: null,
  });
  const [addError, setAddError] = React.useState<string>('');

  // 인라인 편집 상태
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editDraft, setEditDraft] = React.useState<{
    id: number | null;
    name: string;
    price: string;
    description: string;
    is_available: boolean;
    imageFile: File | null;
    imagePreviewUrl: string | null;
  }>({
    id: null,
    name: '',
    price: '',
    description: '',
    is_available: true,
    imageFile: null,
    imagePreviewUrl: null,
  });

  const openAddDialog = () => {
    setAddError('');
    setAddForm(f => ({
      ...f,
      category_id: categories[0]?.id ?? '',
      name: '',
      price: '',
      description: '',
      imageFile: null,
      imagePreviewUrl: null,
    }));
    setAddOpen(true);
  };

  
  // 카테고리 추가 모달용 상태
  const [addCategoryOpen, setAddCategoryOpen] = React.useState(false);
  const [catName, setCatName] = React.useState('');
  const [catError, setCatError] = React.useState('');
  
  const openAddCategory = () => {
    setCatError('');
    setCatName('');
    setAddCategoryOpen(true);
  };
  const closeAddCategory = () => setAddCategoryOpen(false);

  //카테고리 추가 api 호출
  const handleCatSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!catName.trim()) {
    setCatError('카테고리 이름을 입력해 주세요.');
    return;
  }
  try{
    await menuApi.createCategory({ storeId: storeId, name: catName.trim() });
    fetchAll();
  } catch (error) {
    console.error('카테고리 추가 실패:', error);
  }
    console.log('카테고리 추가(데모):', catName.trim());
    closeAddCategory();
  };

  const closeAddDialog = () => setAddOpen(false);

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCategoryChange = (e: any) => {
    setAddForm(prev => ({ ...prev, category_id: e.target.value as number }));
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setAddForm(prev => ({ ...prev, imageFile: null, imagePreviewUrl: null }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setAddForm(prev => ({ ...prev, imageFile: file, imagePreviewUrl: preview }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddError('');
      if (!addForm.category_id) return setAddError('카테고리를 선택해 주세요.');
      if (!addForm.name.trim()) return setAddError('메뉴 이름을 입력해 주세요.');
      if (!addForm.price.trim() || isNaN(Number(addForm.price))) return setAddError('가격을 숫자로 입력해 주세요.');

      const fd = new FormData();
      fd.append('store_id', String(storeId));
      fd.append('category_id', String(addForm.category_id));
      fd.append('name', addForm.name);
      fd.append('price', addForm.price);
      fd.append('description', addForm.description);
      if (addForm.imageFile) fd.append('image', addForm.imageFile);

      await menuApi.createMenuItem(fd);
      await fetchByCategory(selectedCat);
      const all = await menuApi.getMenuByStoreId(storeId);
      setAllItemsCache(all);
      closeAddDialog();
    } catch (err: any) {
      setAddError(err?.response?.data?.message || '메뉴 추가에 실패했습니다.');
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [cats, its] = await Promise.all([
        menuApi.getCategorysByStoreId(storeId),
        menuApi.getMenuByStoreId(storeId),
      ]);
      setCategories(cats);
      setItems(its);
      setAllItemsCache(its); // ← 캐시
      setAddForm(prev => ({ ...prev, category_id: cats[0]?.id ?? '' }));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || '메뉴 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchAll(); }, [storeId]);

  const filteredItems = React.useMemo(() => {
    let list = items;
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(t) ||
        (i.description || '').toLowerCase().includes(t)
      );
    }
    return list;
  }, [items, q]);

  // ====== 인라인 편집 ======
  const startEdit = (item: MenuItemType) => {
    if (isSorting) return; // 정렬 모드에는 편집 금지
    setEditingId(item.id);
    setEditDraft({
      id: item.id,
      name: item.name,
      price: String(item.price ?? ''),
      description: item.description ?? '',
      is_available: !!item.is_available,
      imageFile: null,
      imagePreviewUrl: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({
      id: null,
      name: '',
      price: '',
      description: '',
      is_available: true,
      imageFile: null,
      imagePreviewUrl: null,
    });
  };

  const onDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditDraft(prev => ({ ...prev, [name]: value }));
  };

  const onToggleAvailable = (_: any, checked: boolean) => {
    setEditDraft(prev => ({ ...prev, is_available: checked }));
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setEditDraft(prev => ({ ...prev, imageFile: null, imagePreviewUrl: null }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setEditDraft(prev => ({ ...prev, imageFile: file, imagePreviewUrl: preview }));
  };

  const saveEdit = async () => {
    if (!editingId || editDraft.id !== editingId) return;
    const orig = items.find(i => i.id === editingId);
    if (!orig) { cancelEdit(); return; }

    const fd = new FormData();
    let changed = false;

    if (editDraft.name.trim() && editDraft.name !== orig.name) {
      fd.append('name', editDraft.name.trim());
      changed = true;
    }

    const newPrice = Number(editDraft.price);
    if (!Number.isNaN(newPrice) && Number(orig.price) !== newPrice) {
      fd.append('price', String(newPrice));
      changed = true;
    }
    const newDesc = editDraft.description.trim();
    if ((orig.description || '') !== newDesc) {
      fd.append('description', newDesc);
      changed = true;
    }
    if (Boolean(orig.is_available) !== Boolean(editDraft.is_available)) {
      fd.append('is_available', String(editDraft.is_available));
      changed = true;
    }

    if (editDraft.imageFile) {
      fd.append('image', editDraft.imageFile);
      changed = true;
    }

    if (!changed) { cancelEdit(); return; }

    try {
      await menuApi.updateMenuItem(editingId, fd);
      await fetchByCategory(selectedCat);
      cancelEdit();
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || '메뉴 수정에 실패했습니다.');
    }
  };

  // ====== 정렬 모드 / 드래그앤드롭 ======
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );

  const startSort = () => {
    setIsSorting(true);
    setEditingId(null); // 편집 중이면 종료
    // 현재 보이는 목록을 기준으로 정렬키 초기화
    setSortIds(filteredItems.map(i => String(i.id)));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setSortIds(prev => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // 현재 카드 순서를 바로 UI에 반영
  const applyLocalSortToUI = () => {
    const map = new Map(items.map(i => [i.id, i]));
    const reordered = sortIds
      .map(sid => map.get(Number(sid)))
      .filter(Boolean) as MenuItemType[];

    setItems(reordered);
    // "전체" 탭에서 정렬한 경우엔 캐시도 맞춰주면 탭 전환해도 일관됨
    if (selectedCat === 'all') setAllItemsCache(reordered);
  };
  const saveSort = async () => {
    try {
      // 선택된 범위(전체/카테고리)에 대한 순서를 서버로 전달
      const order = sortIds.map((sid, idx) => ({ itemId: Number(sid), position: idx }));
      const categoryId = selectedCat === 'all' ? 'all' : Number(selectedCat);
      await menuApi.saveSortOrder({ storeId: storeId, categoryId: categoryId, order });
      applyLocalSortToUI();
      setIsSorting(false);
      await fetchByCategory(selectedCat);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || '정렬 저장에 실패했습니다.');
    }
  };

  // 정렬 모드에서 카드(한 개) 드래그 가능 래퍼
  const SortableCard: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 2 : 1,
      touchAction: 'none',
      cursor: 'grab',
    };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    );
  };

  // id → item 매핑 (정렬 모드에서 빠른 접근용)
  const itemById = React.useMemo(() => {
    const m = new Map<number, MenuItemType>();
    for (const it of filteredItems) m.set(it.id, it);
    return m;
  }, [filteredItems]);

  const fetchByCategory = async (cat: 'all' | number) => {
    if (isSorting) return; // 정렬 중 전환 방지 (현 로직 유지)
    try {
      setLoading(true);
      setError('');
      if (cat === 'all') {
        const its = await menuApi.getMenuByStoreId(storeId);
        setItems(its);
      } else {
        const its = await menuApi.getMenuByCategory(storeId, Number(cat));
        setItems(its);
      }
      setSelectedCat(cat);
    } catch (e:any) {
      setError(e?.response?.data?.message || e?.message || '메뉴를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  

  // 개별 카드 공통 렌더(보기/편집/정렬 핸들)
  const renderCard = (item: MenuItemType, forceReadOnly = false) => {
    const isEditing = !forceReadOnly && editingId === item.id;
    const preview = isEditing && editDraft.imagePreviewUrl
      ? editDraft.imagePreviewUrl
      : (item.image_url || undefined);



  
    return (
      <Paper key={item.id} sx={{ p: 2 }}>
        {/* 이미지 */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 120,
            bgcolor: 'grey.100',
            borderRadius: 1,
            mb: 1,
            overflow: 'hidden',
            ...(isEditing ? { '&:hover .overlay': { opacity: 1 } } : {}),
          }}
        >
          {preview ? (
            <img src={preview} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : null}

          {isEditing && (
            <Box
              className="overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity .2s',
              }}
            >
              <Button size="small" variant="contained" component="label">
                이미지 변경
                <input type="file" hidden accept="image/*" onChange={onPickImage} />
              </Button>
            </Box>
          )}

          {/* 정렬 모드일 땐 드래그 핸들 배지 표시(시각적 힌트) */}
          {isSorting && (
            <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', px: 1, py: 0.5, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DragIndicatorIcon fontSize="small" />
              <Typography variant="caption">드래그</Typography>
            </Box>
          )}
        </Box>

        {/* 본문 */}
        {isEditing ? (
          <>
            <TextField
              fullWidth
              size="small"
              label="메뉴 이름"
              name="name"
              value={editDraft.name}
              onChange={onDraftChange}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              size="small"
              label="가격"
              name="price"
              value={editDraft.price}
              onChange={onDraftChange}
              inputMode="decimal"
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth size="small" label="설명"
              name="description" value={editDraft.description}
              onChange={onDraftChange} multiline minRows={2} sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={<Switch checked={editDraft.is_available} onChange={onToggleAvailable} />}
              label="판매중"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" variant="contained" onClick={saveEdit}>완료</Button>
              <Button size="small" variant="outlined" onClick={cancelEdit}>취소</Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 0.5 }}>{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">₩{Number(item.price).toLocaleString()}</Typography>
            {item.description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,   // 2줄 제한
                  overflow: 'hidden',
                  minWidth: 0,
                  wordBreak: 'break-word',     // 긴 단어 강제 줄바꿈
                  overflowWrap: 'anywhere',    // 브라우저별 보강
                }}
              >
                {item.description}
              </Typography>
            ) : null}

            <Typography variant="caption" color={item.is_available ? 'success.main' : 'error.main'}>
              {item.is_available ? '판매중' : '품절'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" variant="outlined" onClick={() => startEdit(item)} disabled={isSorting}>수정</Button>
              <Button size="small" color="error" variant="outlined" disabled>삭제</Button>
            </Box>
          </>
        )}
      </Paper>
    );
  };

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 2 }}>
        {/* 좌측: 카테고리 */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1">카테고리</Typography>
            <IconButton size="small" onClick={fetchAll} title="새로고침">
              {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={`전체 (${allItemsCache.length})`}
              color={selectedCat === 'all' ? 'primary' : 'default'}
              variant={selectedCat === 'all' ? 'filled' : 'outlined'}
              onClick={() => fetchByCategory('all')}
              clickable
            />
            {categories.map(c => {
              const cnt = allItemsCache.filter(i => i.category_id === c.id).length; // 캐시 기반 카운트
              return (
                <Chip
                  key={c.id}
                  label={`${c.name} (${cnt})`}
                  color={selectedCat === c.id ? 'primary' : 'default'}
                  variant={selectedCat === c.id ? 'filled' : 'outlined'}
                  onClick={() => fetchByCategory(c.id)}
                  clickable
                />
              );
            })}
          </Box>

          <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
            {/* 기존 버튼들 */}
            <Button
              variant="outlined"
              fullWidth
              onClick={openAddCategory}
              disabled={isSorting}   // 정렬 중엔 비활성화
              >
              카테고리 추가
            </Button>

            {/* 정렬 토글/저장 버튼 */}
            {!isSorting ? (
              <Button variant="outlined" fullWidth onClick={startSort}>정렬</Button>
            ) : (
              <Button variant="contained" color="primary" fullWidth onClick={saveSort}>정렬 저장</Button>
            )}

            {/* 메뉴 추가 (정렬 중에는 비활성화) */}
            <Button variant="contained" fullWidth onClick={openAddDialog} disabled={isSorting}>메뉴 추가</Button>

            {isSorting && (
              <Alert severity="info" sx={{ mt: 1 }}>
                정렬 모드입니다. 카드를 드래그해서 순서를 바꾼 뒤 <strong>정렬 저장</strong>을 누르세요.
              </Alert>
            )}
          </Box>
        </Paper>

        {/* 우측: 메뉴 목록 */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">메뉴 목록</Typography>
            <TextField
              size="small"
              placeholder="검색(이름/설명)"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              disabled={isSorting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          {loading ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : filteredItems.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              표시할 메뉴가 없습니다.
            </Box>
          ) : (
            <>
              {!isSorting ? (
                // 일반 모드
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
                  {filteredItems.map(item => renderCard(item))}
                </Box>
              ) : (
                // 정렬 모드: dnd-kit
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={sortIds} strategy={rectSortingStrategy}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
                      {sortIds.map(id => {
                        const it = itemById.get(Number(id));
                        if (!it) return null;
                        return (
                          <SortableCard key={id} id={id}>
                            {renderCard(it, /*forceReadOnly*/ true)}
                          </SortableCard>
                        );
                      })}
                    </Box>
                  </SortableContext>
                </DndContext>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* === Add Menu Dialog === */}
      <Dialog open={addOpen} onClose={closeAddDialog} fullWidth maxWidth="sm">
        <form onSubmit={handleAddSubmit}>
          <DialogTitle>메뉴 추가</DialogTitle>
          <DialogContent dividers>
            {addError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAddError('')}>{addError}</Alert>}

            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="add-category-label">카테고리</InputLabel>
              <Select
                labelId="add-category-label"
                label="카테고리"
                value={addForm.category_id}
                onChange={handleAddCategoryChange}
              >
                {categories.map(c => (
                  <MuiMenuItem key={c.id} value={c.id}>{c.name}</MuiMenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              sx={{ mt: 2 }}
              name="name"
              label="메뉴 이름"
              fullWidth
              value={addForm.name}
              onChange={handleAddChange}
              required
            />

            <TextField
              sx={{ mt: 2 }}
              name="price"
              label="가격"
              fullWidth
              value={addForm.price}
              onChange={handleAddChange}
              inputMode="decimal"
              placeholder="예) 4500"
              required
            />

            <TextField
              sx={{ mt: 2 }}
              name="description"
              label="설명"
              fullWidth
              value={addForm.description}
              onChange={handleAddChange}
              multiline
              minRows={3}
            />

            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component="label">
                이미지 선택
                <input type="file" hidden accept="image/*" onChange={handleImagePick} />
              </Button>
              {addForm.imagePreviewUrl && (
                <Box sx={{ mt: 1, width: '100%', height: 160, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100' }}>
                  <img
                    src={addForm.imagePreviewUrl}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAddDialog}>취소</Button>
            <Button type="submit" variant="contained">추가</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* === Add Category Dialog (UI-only) === */}
      <Dialog open={addCategoryOpen} onClose={closeAddCategory} fullWidth maxWidth="xs">
        <form onSubmit={handleCatSubmit}>
          <DialogTitle>카테고리 추가</DialogTitle>
          <DialogContent dividers>
            {catError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCatError('')}>
                {catError}
              </Alert>
            )}
            <TextField
              autoFocus
              label="카테고리 이름"
              fullWidth
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="예) 인기상품"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAddCategory}>취소</Button>
            <Button type="submit" variant="contained">추가</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default MenuManagementPanel;
