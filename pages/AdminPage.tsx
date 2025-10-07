
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageContent, Project, TeamMember, BlogPost, NavLink, ValueItem, HeroSlide, AlliancePartner, ContentBlockType, ProjectActivity, Statistic, User, SocialLink, LocalizedText } from '../types';
import { useTranslate, TranslationKey } from '../i18n';
import { produce } from 'immer';
import PageBanner from '../components/PageBanner';
import { useAdmin } from '../components/AdminContext';
import TabbedListEditor from '../components/TabbedListEditor';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';

interface AdminPageProps {
  content: PageContent;
  onUpdateContent: (newContent: PageContent) => Promise<boolean>;
  onDiscardChanges: () => void;
  apiUrl: string;
}

type AdminTab = 'global' | 'home' | 'about' | 'projects' | 'team' | 'blog' | 'contact' | 'donate' | 'users';
const ADMIN_STATE_KEY = 'biophilia_admin_state';
const ADMIN_SCROLL_POSITIONS_KEY = 'biophilia_admin_scroll_positions';


// User Management Component
const UserManagement: React.FC<{ apiUrl: string }> = ({ apiUrl }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const t = useTranslate();
    const { currentUser } = useAdmin();

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/users`);
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${apiUrl}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            if (!res.ok) throw new Error('Failed to create user');
            alert(t('userCreated'));
            setNewUser({ username: '', password: '' });
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to create user');
        }
    };
    
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            const res = await fetch(`${apiUrl}/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: editingUser.username,
                    password: editingUser.password, // Send password only if it's being changed
                }),
            });
            if (!res.ok) throw new Error('Failed to update user');
            alert(t('userUpdated'));
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to update user');
        }
    };


    const handleDeleteUser = async (userId: number) => {
        if (window.confirm(t('confirmDeleteUser'))) {
            try {
                const res = await fetch(`${apiUrl}/api/users/${userId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete user');
                alert(t('userDeleted'));
                fetchUsers();
            } catch (error) {
                console.error(error);
                alert(error instanceof Error ? error.message : 'Failed to delete user');
            }
        }
    };
    
    if (isLoading) return <p>Loading users...</p>;

    return (
        <div>
            {editingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setEditingUser(null)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Edit User</h3>
                        <form onSubmit={handleUpdateUser}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={editingUser.username}
                                onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                className="border p-2 rounded w-full mb-2"
                                required
                            />
                            <input
                                type="password"
                                placeholder="New Password (optional)"
                                value={editingUser.password || ''}
                                onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                                className="border p-2 rounded w-full mb-4"
                            />
                             <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setEditingUser(null)} className="bg-gray-300 text-black px-4 py-2 rounded">{t('cancel')}</button>
                                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{t('save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8 p-4 border rounded-lg bg-white">
                <h3 className="text-xl font-semibold mb-4">{t('addNewUser')}</h3>
                <form onSubmit={handleCreateUser} className="flex items-end space-x-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-bold mb-1">{t('username')}</label>
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div className="flex-grow">
                        <label className="block text-sm font-bold mb-1">{t('password')}</label>
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-brand-accent text-white px-4 py-2 rounded self-end">{t('addNewUser')}</button>
                </form>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">{t('userManagement')}</h3>
            <div className="space-y-2">
                {users.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span>{user.username}</span>
                        <div className="space-x-2">
                             <button onClick={() => setEditingUser({...user, password: ''})} className="bg-blue-500 text-white text-sm px-3 py-1 rounded">{t('edit')}</button>
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={currentUser?.id === user.id}
                                className="bg-red-600 text-white text-sm px-3 py-1 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {t('delete')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AdminPage: React.FC<AdminPageProps> = ({ content, onUpdateContent, onDiscardChanges, apiUrl }) => {
  const [formData, setFormData] = useState<PageContent>(JSON.parse(JSON.stringify(content)));
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const t = useTranslate();
  const { openMediaLibrary } = useAdmin();

  const [adminState, setAdminState] = useState(() => {
    try {
      const savedState = sessionStorage.getItem(ADMIN_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Only take what we need, provide defaults
        return {
          activeTab: parsed.activeTab || 'global',
          selectedIndices: parsed.selectedIndices || {},
          programAccordionOpen: typeof parsed.programAccordionOpen === 'boolean' ? parsed.programAccordionOpen : true,
        };
      }
    } catch (e) {
      console.error("Failed to parse admin state from session storage:", e);
    }
    // Default state
    return {
      activeTab: 'global',
      selectedIndices: {},
      programAccordionOpen: true,
    };
  });
  
  // Save state to session storage
  useEffect(() => {
    try {
        sessionStorage.setItem(ADMIN_STATE_KEY, JSON.stringify(adminState));
    } catch (e) {
        console.error("Failed to save admin state to session storage:", e);
    }
  }, [adminState]);
  
  // Effect to restore scroll position on tab change
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const scrollPositions = JSON.parse(sessionStorage.getItem(ADMIN_SCROLL_POSITIONS_KEY) || '{}');
        const savedPosition = scrollPositions[adminState.activeTab];
        if (typeof savedPosition === 'number') {
          window.scrollTo(0, savedPosition);
        }
      } catch (e) {
        console.error("Could not restore scroll position:", e);
      }
    }, 100); // A small delay to allow DOM to render

    return () => clearTimeout(timer);
  }, [adminState.activeTab]);

  const handleTabChange = (tab: AdminTab) => {
    // Save current scroll position before changing tab
    try {
        const scrollPositions = JSON.parse(sessionStorage.getItem(ADMIN_SCROLL_POSITIONS_KEY) || '{}');
        scrollPositions[adminState.activeTab] = window.scrollY;
        sessionStorage.setItem(ADMIN_SCROLL_POSITIONS_KEY, JSON.stringify(scrollPositions));
    } catch (e) {
        console.error("Could not save scroll position:", e);
    }
    setAdminState(prevState => ({ ...prevState, activeTab: tab }));
  };
  
  const handleSelectedIndexChange = (key: string, index: number) => {
    setAdminState(prevState => {
        const newIndices = { ...prevState.selectedIndices, [key]: index };
        // If we are changing a program, reset its activity index
        if (key === 'projects.list' && prevState.selectedIndices[key] !== index) {
            delete newIndices[`projects.${prevState.selectedIndices[key]}.activities`];
        }
        return { ...prevState, selectedIndices: newIndices };
    });
  };
  
  const handleProgramAccordionToggle = () => {
    setAdminState(prevState => ({
        ...prevState,
        programAccordionOpen: !prevState.programAccordionOpen
    }));
  };

  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(content)));
  }, [content]);
  
  const TABS: { key: AdminTab; labelKey: TranslationKey }[] = [
    { key: 'global', labelKey: 'tabGlobal' },
    { key: 'home', labelKey: 'tabHome' },
    { key: 'about', labelKey: 'tabAbout' },
    { key: 'projects', labelKey: 'tabProjects' },
    { key: 'team', labelKey: 'tabTeam' },
    { key: 'blog', labelKey: 'tabBlog' },
    { key: 'contact', labelKey: 'tabContact' },
    { key: 'donate', labelKey: 'tabDonate' },
    { key: 'users', labelKey: 'tabUsers'},
  ];

  const handleFieldChange = useCallback((path: string, value: any) => {
    setFormData(produce(draft => {
        const keys = path.split('.');
        let current: any = draft;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current[key] === undefined || current[key] === null) {
                if (!isNaN(parseInt(keys[i + 1], 10))) {
                    current[key] = [];
                } else {
                    current[key] = {};
                }
            }
            current = current[key];
        }
        if (current !== undefined && current !== null) {
            current[keys[keys.length - 1]] = value;
        }
    }));
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    const success = await onUpdateContent(formData);
    if (success) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
    }
  };

  const renderTextField = useCallback((labelKey: TranslationKey | string, path: string, value: string, isTextarea: boolean = false, type: string = 'text') => {
    const InputComponent = isTextarea ? 'textarea' : 'input';
    return (
      <div className="mb-4">
        <label className="block text-brand-gray text-sm font-bold mb-2">{labelKey}</label>
        <InputComponent
          type={type}
          value={value || ''}
          onChange={(e) => handleFieldChange(path, e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-white"
          rows={isTextarea ? 10 : undefined}
        />
      </div>
    );
  }, [handleFieldChange, t]);
  
  const renderImageField = useCallback((label: string, path: string, value: string) => {
    return (
        <div className="mb-4">
            <label className="block text-brand-gray text-sm font-bold mb-2">{label}</label>
            {value && (
                <div className="my-2 p-2 border rounded bg-gray-50 inline-block">
                    <img 
                        src={value} 
                        alt="Preview" 
                        className="h-24 w-auto object-contain" 
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                        onLoad={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'inline-block'; }}
                    />
                </div>
            )}
            <div className="flex items-center">
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleFieldChange(path, e.target.value)}
                    className="shadow appearance-none border rounded-l w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-white"
                    placeholder="https://..."
                />
                <button
                    type="button"
                    onClick={() => openMediaLibrary(path)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
                >
                    Select
                </button>
            </div>
        </div>
    );
  }, [handleFieldChange, openMediaLibrary]);


  const renderLocalizedTextField = useCallback((baseLabel: string, basePath: string, value: LocalizedText, isTextarea: boolean = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderTextField(`${baseLabel} (EN)`, `${basePath}.en`, value?.en, isTextarea)}
        {renderTextField(`${baseLabel} (ES)`, `${basePath}.es`, value?.es, isTextarea)}
    </div>
  ), [renderTextField]);
  
  const handlers = useMemo(() => ({
    handleFieldChange,
    renderTextField,
    renderLocalizedTextField,
    renderImageField,
    t
  }), [handleFieldChange, renderTextField, renderLocalizedTextField, renderImageField, t]);
  
  return (
    <>
      <PageBanner title={t('adminPanelTitle')} imageUrl="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1920&h=1080&fit=crop" />
      <div className="bg-white py-8">
        <div className="container mx-auto px-4 sm-px-6 lg:px-8">
          
          <div className="flex items-center space-x-4 mb-4 sticky top-[9rem] bg-white py-4 z-30 border-b">
            <button onClick={handleSave} disabled={status === 'saving'} className="bg-brand-green-dark hover:bg-brand-green-dark/90 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-400">{status === 'saving' ? 'Saving...' : t('saveChanges')}</button>
            <button onClick={onDiscardChanges} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline">{t('discardChanges')}</button>
            {status === 'success' && <div className="bg-brand-accent text-white font-bold py-2 px-4 rounded-lg">{t('changesSaved')}</div>}
            {status === 'error' && <div className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg">Save failed.</div>}
          </div>

          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${adminState.activeTab === tab.key ? 'border-brand-accent text-brand-green-dark' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t(tab.labelKey)}</button>
              ))}
            </nav>
          </div>

          <div className="bg-brand-green-light p-6 rounded-lg shadow-inner">
            {adminState.activeTab === 'global' && <GlobalTab data={formData.global} handlers={handlers} onUpdate={handleFieldChange} selectedIndices={adminState.selectedIndices} onSelectIndex={handleSelectedIndexChange} />}
            {adminState.activeTab === 'home' && <HomeTab data={formData.homePage} handlers={handlers} onUpdate={handleFieldChange} selectedIndices={adminState.selectedIndices} onSelectIndex={handleSelectedIndexChange} />}
            {adminState.activeTab === 'about' && <AboutTab data={formData.aboutPage} handlers={handlers} onUpdate={handleFieldChange} selectedIndex={adminState.selectedIndices['about.values']} onSelectIndex={(i) => handleSelectedIndexChange('about.values', i)} />}
            {adminState.activeTab === 'projects' && <ProjectsTab data={formData} handlers={handlers} onUpdate={handleFieldChange} selectedIndices={adminState.selectedIndices} onSelectIndex={handleSelectedIndexChange} isAccordionOpen={adminState.programAccordionOpen} onAccordionToggle={handleProgramAccordionToggle} />}
            {adminState.activeTab === 'team' && <TeamTab data={formData} handlers={handlers} onUpdate={handleFieldChange} selectedIndex={adminState.selectedIndices['team.members']} onSelectIndex={(i) => handleSelectedIndexChange('team.members', i)} />}
            {adminState.activeTab === 'blog' && <BlogTab data={formData} handlers={handlers} onUpdate={handleFieldChange} selectedIndex={adminState.selectedIndices['blog.posts']} onSelectIndex={(i) => handleSelectedIndexChange('blog.posts', i)} />}
            {adminState.activeTab === 'contact' && <ContactTab data={formData.contactPage} handlers={handlers} />}
            {adminState.activeTab === 'donate' && <DonateTab data={formData.donatePage} handlers={handlers} />}
            {adminState.activeTab === 'users' && <UserManagement apiUrl={apiUrl} />}
          </div>
        </div>
      </div>
    </>
  );
};

const AdminSection: React.FC<{ titleKey: TranslationKey; children: React.ReactNode }> = ({ titleKey, children }) => {
    const t = useTranslate();
    return (
        <div className="border-t pt-6 mt-6 first:mt-0 first:pt-0 first:border-t-0">
            <h3 className="text-xl font-semibold text-brand-green-dark mb-4">{t(titleKey)}</h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
};


// TAB COMPONENTS
const GlobalTab = ({data, handlers, onUpdate, selectedIndices, onSelectIndex}: {data: PageContent['global'], handlers: any, onUpdate: (path: string, value: any) => void, selectedIndices: any, onSelectIndex: (key: string, index: number) => void}) => {
    const { renderImageField, renderTextField, renderLocalizedTextField, t } = handlers;
    
    const newNavLinkTemplate: Omit<NavLink, 'id'> = { to: '/', label: { en: '', es: '' } };
    const newSocialLinkTemplate: Omit<SocialLink, 'id'> = { url: '#' };
    
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabGlobal')}</h2>
        {renderImageField('Logo URL', 'global.logoUrl', data.logoUrl)}
        <AdminSection titleKey="sectionNavigation">
             <TabbedListEditor<NavLink>
                items={data.navigation || []}
                onListChange={(newList) => onUpdate('global.navigation', newList)}
                getItemTitle={(item, index) => item.label?.en || `Link ${index + 1}`}
                onAddItemTemplate={newNavLinkTemplate}
                entityName="Link"
                selectedIndex={selectedIndices['global.navigation'] || 0}
                onSelectIndex={(i) => onSelectIndex('global.navigation', i)}
                renderEditor={(item, index, onRemove) => (
                    <>
                        <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                        {renderTextField('URL Path (e.g., /about)', `global.navigation.${index}.to`, item.to)}
                        {renderLocalizedTextField('Label', `global.navigation.${index}.label`, item.label)}
                    </>
                )}
            />
        </AdminSection>
        <AdminSection titleKey="sectionSocial">
            <TabbedListEditor<SocialLink>
                items={data.socialLinks || []}
                onListChange={(newList) => onUpdate('global.socialLinks', newList)}
                getItemTitle={(item, index) => item.id || `Social ${index + 1}`}
                onAddItemTemplate={newSocialLinkTemplate}
                entityName="Social Link"
                selectedIndex={selectedIndices['global.socialLinks'] || 0}
                onSelectIndex={(i) => onSelectIndex('global.socialLinks', i)}
                renderEditor={(item, index, onRemove) => (
                    <>
                        <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                        {renderTextField('Platform (facebook, instagram, linkedin, twitter)', `global.socialLinks.${index}.id`, item.id)}
                        {renderTextField('URL', `global.socialLinks.${index}.url`, item.url)}
                    </>
                )}
            />
        </AdminSection>
        <AdminSection titleKey="sectionFooter">
            {renderLocalizedTextField('Slogan', 'global.footer.slogan', data.footer?.slogan)}
            {renderLocalizedTextField('Copyright', 'global.footer.copyright', data.footer?.copyright)}
            {renderTextField('Address', 'global.footer.contact.address', data.footer?.contact?.address)}
            {renderTextField('Email', 'global.footer.contact.email', data.footer?.contact?.email)}
        </AdminSection>
    </>
};

const HomeTab = ({data, handlers, onUpdate, selectedIndices, onSelectIndex}: {data: PageContent['homePage'], handlers: any, onUpdate: (path: string, value: any) => void, selectedIndices: any, onSelectIndex: (key: string, index: number) => void}) => {
    const { renderLocalizedTextField, renderImageField, renderTextField, t } = handlers;

    const newHeroSlideTemplate: Omit<HeroSlide, 'id'> = { title: { en: '', es: '' }, subtitle: { en: '', es: '' }, imageUrl: '', projectId: '', activityId: '' };
    const newActionLineTemplate: Omit<ValueItem, 'id'> = { title: { en: '', es: '' }, slogan: { en: '', es: '' }, text: { en: '', es: '' }, icon: 'LeafIcon', imageUrl: '' };
    const newStatTemplate: Omit<Statistic, 'id'> = { iconUrl: 'https://img.icons8.com/ios-glyphs/90/ffffff/deciduous-tree.png', value: '0', label: { en: '', es: '' }, backgroundImages: [] };
    const newAlliancePartnerTemplate: Omit<AlliancePartner, 'id'> = { name: '', logoUrl: '' };
    
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabHome')}</h2>
        <AdminSection titleKey="sectionHero">
            <TabbedListEditor<HeroSlide>
                items={data.heroSlides || []}
                onListChange={(newList) => onUpdate('homePage.heroSlides', newList)}
                getItemTitle={(item, index) => item.title?.en || `Slide ${index+1}`}
                onAddItemTemplate={newHeroSlideTemplate}
                entityName="Slide"
                selectedIndex={selectedIndices['home.hero'] || 0}
                onSelectIndex={(i) => onSelectIndex('home.hero', i)}
                renderEditor={(slide, index, onRemove) => (
                    <>
                        <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                        {renderLocalizedTextField('Title', `homePage.heroSlides.${index}.title`, slide.title)}
                        {renderLocalizedTextField('Subtitle', `homePage.heroSlides.${index}.subtitle`, slide.subtitle, true)}
                        {renderImageField('Image URL', `homePage.heroSlides.${index}.imageUrl`, slide.imageUrl)}
                        {renderTextField('Program ID (optional)', `homePage.heroSlides.${index}.projectId`, slide.projectId || '')}
                        {renderTextField('Activity ID (optional)', `homePage.heroSlides.${index}.activityId`, slide.activityId || '')}
                    </>
                )}
            />
        </AdminSection>
        <AdminSection titleKey="sectionWelcome">
            {renderLocalizedTextField('Title Part 1', 'homePage.welcome.titlePart1', data.welcome?.titlePart1)}
            {renderLocalizedTextField('Title Part 2', 'homePage.welcome.titlePart2', data.welcome?.titlePart2)}
            {renderLocalizedTextField('Slogan', 'homePage.welcome.slogan', data.welcome?.slogan)}
            {renderLocalizedTextField('Text', 'homePage.welcome.text', data.welcome?.text, true)}
            {renderImageField('Image URL', 'homePage.welcome.imageUrl', data.welcome?.imageUrl)}
            {renderTextField('Image Alt Text', 'homePage.welcome.imageAlt', data.welcome?.imageAlt)}
        </AdminSection>
        <AdminSection titleKey="sectionActionLines">
            {renderLocalizedTextField('Section Title', 'homePage.actionLines.title', data.actionLines?.title)}
            <TabbedListEditor<ValueItem>
                items={data.actionLines?.items || []}
                onListChange={(newList) => onUpdate('homePage.actionLines.items', newList)}
                getItemTitle={(item, index) => item.title?.en || `Focus Area ${index + 1}`}
                onAddItemTemplate={newActionLineTemplate}
                entityName="Focus Area"
                selectedIndex={selectedIndices['home.actionLines'] || 0}
                onSelectIndex={(i) => onSelectIndex('home.actionLines', i)}
                renderEditor={(item, index, onRemove) => (
                    <>
                        <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                        {renderLocalizedTextField('Title', `homePage.actionLines.items.${index}.title`, item.title)}
                        {renderLocalizedTextField('Slogan', `homePage.actionLines.items.${index}.slogan`, item.slogan || {en:'', es:''})}
                        {renderLocalizedTextField('Text', `homePage.actionLines.items.${index}.text`, item.text, true)}
                        {renderTextField('Icon Name', `homePage.actionLines.items.${index}.icon`, item.icon || '')}
                        {renderImageField('Image URL', `homePage.actionLines.items.${index}.imageUrl`, item.imageUrl || '')}
                    </>
                )}
            />
        </AdminSection>
         <AdminSection titleKey="sectionLatestProjects">
            {renderLocalizedTextField('Title', 'homePage.latestProjects.title', data.latestProjects?.title)}
            {renderLocalizedTextField('Slogan', 'homePage.latestProjects.slogan', data.latestProjects?.slogan)}
            {renderLocalizedTextField('Subtitle', 'homePage.latestProjects.subtitle', data.latestProjects?.subtitle, true)}
        </AdminSection>
        <AdminSection titleKey="sectionParallax">
            {renderLocalizedTextField('Parallax 1 Title', 'homePage.parallax1.title', data.parallax1?.title)}
            {renderLocalizedTextField('Parallax 1 Text', 'homePage.parallax1.text', data.parallax1?.text, true)}
            {renderImageField('Parallax 1 Image URL', 'homePage.parallax1.imageUrl', data.parallax1?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionOurNumbers">
          {renderLocalizedTextField('Section Title', 'homePage.ourNumbers.title', data.ourNumbers?.title)}
          {renderLocalizedTextField('Description', 'homePage.ourNumbers.description', data.ourNumbers?.description, true)}
          <TabbedListEditor<Statistic>
            items={data.ourNumbers?.stats || []}
            onListChange={(newList) => onUpdate('homePage.ourNumbers.stats', newList)}
            getItemTitle={(item, index) => item.label?.en || `Stat ${index+1}`}
            onAddItemTemplate={newStatTemplate}
            entityName="Statistic"
            selectedIndex={selectedIndices['home.stats'] || 0}
            onSelectIndex={(i) => onSelectIndex('home.stats', i)}
            renderEditor={(item, index, onRemove) => (
              <>
                <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                {renderImageField('Icon URL', `homePage.ourNumbers.stats.${index}.iconUrl`, item.iconUrl)}
                {renderTextField('Value (e.g., 50+)', `homePage.ourNumbers.stats.${index}.value`, item.value)}
                {renderLocalizedTextField('Label', `homePage.ourNumbers.stats.${index}.label`, item.label)}
                
                <div className="mt-4 border-t pt-4">
                    <h5 className="font-semibold text-gray-600 mb-2">Background Images (for rotating carousel)</h5>
                    <div className="space-y-2">
                      {(item.backgroundImages || []).map((bgUrl, bgIndex) => (
                          <div key={bgIndex} className="flex items-end space-x-2">
                              <div className="flex-grow">
                                  {renderImageField(`Image ${bgIndex + 1}`, `homePage.ourNumbers.stats.${index}.backgroundImages.${bgIndex}`, bgUrl)}
                              </div>
                              <button
                                  type="button"
                                  onClick={() => {
                                      if (window.confirm('Are you sure you want to remove this image?')) {
                                          const newList = [...(item.backgroundImages || [])];
                                          newList.splice(bgIndex, 1);
                                          onUpdate(`homePage.ourNumbers.stats.${index}.backgroundImages`, newList);
                                      }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 text-sm rounded mb-4"
                              >
                                  Remove
                              </button>
                          </div>
                      ))}
                      <button
                          type="button"
                          onClick={() => {
                              const newList = [...(item.backgroundImages || []), ''];
                              onUpdate(`homePage.ourNumbers.stats.${index}.backgroundImages`, newList);
                          }}
                          className="bg-blue-500 text-white font-bold py-2 px-4 text-sm rounded hover:bg-blue-600"
                      >
                          Add Background Image
                      </button>
                    </div>
                </div>
              </>
            )}
          />
        </AdminSection>
        <AdminSection titleKey="sectionAlliances">
            {renderLocalizedTextField('Title', 'homePage.alliances.title', data.alliances?.title)}
            {renderLocalizedTextField('Description', 'homePage.alliances.description', data.alliances?.description, true)}
             <TabbedListEditor<AlliancePartner>
                items={data.alliances?.partners || []}
                onListChange={(newList) => onUpdate('homePage.alliances.partners', newList)}
                getItemTitle={(item) => item.name || `Partner`}
                onAddItemTemplate={newAlliancePartnerTemplate}
                entityName="Partner"
                selectedIndex={selectedIndices['home.partners'] || 0}
                onSelectIndex={(i) => onSelectIndex('home.partners', i)}
                renderEditor={(item, index, onRemove) => (
                    <>
                        <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                        {renderTextField('Name', `homePage.alliances.partners.${index}.name`, item.name)}
                        {renderImageField('Logo URL', `homePage.alliances.partners.${index}.logoUrl`, item.logoUrl)}
                    </>
                )}
            />
        </AdminSection>
         <AdminSection titleKey="sectionParallax">
            {renderLocalizedTextField('Parallax 2 Title', 'homePage.parallax2.title', data.parallax2?.title)}
            {renderLocalizedTextField('Parallax 2 Text', 'homePage.parallax2.text', data.parallax2?.text, true)}
            {renderImageField('Parallax 2 Image URL', 'homePage.parallax2.imageUrl', data.parallax2?.imageUrl)}
        </AdminSection>
    </>
};

const ContentBlockEditor: React.FC<{basePath: string, data: ContentBlockType, handlers: any}> = ({ basePath, data, handlers }) => {
    const { renderLocalizedTextField, renderImageField, renderTextField } = handlers;
    return <>
        {renderLocalizedTextField('Title', `${basePath}.title`, data?.title)}
        {renderLocalizedTextField('Text', `${basePath}.text`, data?.text, true)}
        {renderImageField('Image URL', `${basePath}.imageUrl`, data?.imageUrl)}
        {renderTextField('Image Alt Text', `${basePath}.imageAlt`, data?.imageAlt)}
    </>
}

const AboutTab = ({data, handlers, onUpdate, selectedIndex, onSelectIndex}: {data: PageContent['aboutPage'], handlers: any, onUpdate: (path: string, value: any) => void, selectedIndex: number, onSelectIndex: (index: number) => void}) => {
    const { t, renderLocalizedTextField, renderImageField, renderTextField } = handlers;
    const newValueItemTemplate: Omit<ValueItem, 'id'> = { title: { en: '', es: '' }, text: { en: '', es: '' }, imageUrl: '', icon: '' };
    
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabAbout')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'aboutPage.banner.title', data.banner?.title)}
            {renderImageField('Image URL', 'aboutPage.banner.imageUrl', data.banner?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionHistory">
            {renderLocalizedTextField('Title', 'aboutPage.history.title', data.history?.title)}
            {renderLocalizedTextField('Text', 'aboutPage.history.text', data.history?.text, true)}
            {renderImageField('Image URL', 'aboutPage.history.imageUrl', data.history?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionMission">
            <ContentBlockEditor basePath="aboutPage.mission" data={data.mission} handlers={handlers} />
        </AdminSection>
        <AdminSection titleKey="sectionVision">
            <ContentBlockEditor basePath="aboutPage.vision" data={data.vision} handlers={handlers} />
        </AdminSection>
        <AdminSection titleKey="sectionWork">
            <ContentBlockEditor basePath="aboutPage.work" data={data.work} handlers={handlers} />
        </AdminSection>
        <AdminSection titleKey="sectionValues">
            {renderLocalizedTextField('Section Title', 'aboutPage.values.title', data.values?.title)}
             <TabbedListEditor<ValueItem>
                items={data.values?.items || []}
                onListChange={(newList) => onUpdate('aboutPage.values.items', newList)}
                getItemTitle={(item, index) => item.title?.en || `Value ${index+1}`}
                onAddItemTemplate={newValueItemTemplate}
                entityName="Value"
                selectedIndex={selectedIndex}
                onSelectIndex={onSelectIndex}
                renderEditor={(item, index, onRemove) => (
                    <>
                        <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                        {renderLocalizedTextField('Title', `aboutPage.values.items.${index}.title`, item.title)}
                        {renderLocalizedTextField('Text', `aboutPage.values.items.${index}.text`, item.text, true)}
                        {renderImageField('Image URL', `aboutPage.values.items.${index}.imageUrl`, item.imageUrl || '')}
                        {renderTextField('Icon Name (e.g., ValueCollaborationIcon)', `aboutPage.values.items.${index}.icon`, item.icon || '')}
                    </>
                )}
            />
        </AdminSection>
    </>
};

const ProjectsTab = ({data, handlers, onUpdate, selectedIndices, onSelectIndex, isAccordionOpen, onAccordionToggle}: {data: PageContent, handlers: any, onUpdate: (path: string, value: any) => void, selectedIndices: any, onSelectIndex: (key: string, index: number) => void, isAccordionOpen: boolean, onAccordionToggle: () => void}) => {
    const { t, renderLocalizedTextField, renderImageField, renderTextField, handleFieldChange } = handlers;
    const newProjectTemplate: Omit<Project, 'id'> = { title: { en: '', es: '' }, description: { en: '', es: '' }, detailDescription: { en: '', es: '' }, imageUrl: '', imageAlt: '', detailImageUrl: '', display_order: 0, activities: [] };
    const newActivityTemplate: Omit<ProjectActivity, 'id'> = { date: new Date().toISOString().split('T')[0], title: { en: '', es: '' }, description: { en: '', es: '' }, imageUrl: '', display_order: 0 };
    
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabProjects')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'projectsPage.banner.title', data.projectsPage?.banner?.title)}
            {renderImageField('Image URL', 'projectsPage.banner.imageUrl', data.projectsPage?.banner?.imageUrl)}
            {renderLocalizedTextField('Slogan', 'projectsPage.slogan', data.projectsPage?.slogan)}
            {renderLocalizedTextField('Intro Text', 'projectsPage.intro', data.projectsPage?.intro, true)}
        </AdminSection>
        <AdminSection titleKey="sectionProjectDetail">
             {renderLocalizedTextField('Back to Programs Button', 'projectDetailPage.backToProjects', data.projectDetailPage?.backToProjects)}
        </AdminSection>

        <AdminSection titleKey="tabProjects">
             <TabbedListEditor<Project>
                items={data.projects || []}
                onListChange={(newList) => onUpdate('projects', newList)}
                getItemTitle={(item, index) => item.title?.en || `Program ${index+1}`}
                onAddItemTemplate={newProjectTemplate}
                entityName="Program"
                selectedIndex={selectedIndices['projects.list'] || 0}
                onSelectIndex={(i) => onSelectIndex('projects.list', i)}
                renderEditor={(project, projIndex, onRemove) => (
                    <>
                        <div className="flex justify-between items-center border-b mb-4 pb-2 -mt-2">
                            <span className="font-semibold text-gray-700">Program Details</span>
                            <div className="flex items-center space-x-2">
                                <button onClick={onAccordionToggle} className="p-1 text-gray-500 hover:text-brand-green-dark" aria-label={isAccordionOpen ? 'Collapse Details' : 'Expand Details'}>
                                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <button onClick={onRemove} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded">Remove</button>
                            </div>
                        </div>

                        <div className={`accordion-content ${isAccordionOpen ? 'open' : ''}`}>
                            <div className="pt-2">
                                {renderTextField('ID (must be unique)', `projects.${projIndex}.id`, project.id)}
                                {renderLocalizedTextField('Title', `projects.${projIndex}.title`, project.title)}
                                {renderLocalizedTextField('Description', `projects.${projIndex}.description`, project.description, true)}
                                {renderLocalizedTextField('Detail Page Description', `projects.${projIndex}.detailDescription`, project.detailDescription, true)}
                                {renderImageField('Image URL (Card)', `projects.${projIndex}.imageUrl`, project.imageUrl)}
                                {renderTextField('Image Alt Text', `projects.${projIndex}.imageAlt`, project.imageAlt)}
                                {renderImageField('Image URL (Detail Page Banner)', `projects.${projIndex}.detailImageUrl`, project.detailImageUrl)}
                            </div>
                        </div>

                        <div className="mt-4 pt-4">
                            <h5 className="font-semibold text-gray-600 mb-2">Activities</h5>
                             <TabbedListEditor<ProjectActivity>
                                items={project.activities || []}
                                onListChange={(newList) => onUpdate(`projects.${projIndex}.activities`, newList)}
                                getItemTitle={(item, index) => item.title?.en || `Activity ${index+1}`}
                                onAddItemTemplate={newActivityTemplate}
                                entityName="Activity"
                                selectedIndex={selectedIndices[`projects.${projIndex}.activities`] || 0}
                                onSelectIndex={(i) => onSelectIndex(`projects.${projIndex}.activities`, i)}
                                renderEditor={(activity, actIndex, onRemoveActivity) => (
                                    <>
                                        <div className="flex items-end space-x-4 mb-4">
                                            <div className="flex-grow">
                                                <label className="block text-brand-gray text-sm font-bold mb-2">{t('date')}</label>
                                                <input
                                                    type="date"
                                                    value={activity.date ? activity.date.split('T')[0] : ''}
                                                    onChange={(e) => handleFieldChange(`projects.${projIndex}.activities.${actIndex}.date`, e.target.value)}
                                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-brand-gray leading-tight focus:outline-none focus:shadow-outline bg-white"
                                                />
                                            </div>
                                            <button onClick={onRemoveActivity} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 text-sm rounded flex-shrink-0">Remove</button>
                                        </div>
                                        {renderTextField('ID (must be unique)', `projects.${projIndex}.activities.${actIndex}.id`, activity.id)}
                                        {renderLocalizedTextField('Title', `projects.${projIndex}.activities.${actIndex}.title`, activity.title)}
                                        {renderLocalizedTextField('Description', `projects.${projIndex}.activities.${actIndex}.description`, activity.description, true)}
                                        {renderImageField('Image URL', `projects.${projIndex}.activities.${actIndex}.imageUrl`, activity.imageUrl)}
                                    </>
                                )}
                             />
                        </div>
                    </>
                )}
            />
        </AdminSection>
    </>
};

const TeamTab = ({data, handlers, onUpdate, selectedIndex, onSelectIndex}: {data: PageContent, handlers: any, onUpdate: (path: string, value: any) => void, selectedIndex: number, onSelectIndex: (index: number) => void}) => {
     const { t, renderLocalizedTextField, renderImageField, renderTextField } = handlers;
    const newTeamMemberTemplate: Omit<TeamMember, 'id'> = { name: { en: '', es: '' }, role: { en: '', es: '' }, bio: { en: '', es: '' }, imageUrl: '', imageAlt: '', display_order: 0 };
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabTeam')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'teamPage.banner.title', data.teamPage?.banner?.title)}
            {renderImageField('Image URL', 'teamPage.banner.imageUrl', data.teamPage?.banner?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="tabTeam">
            <TabbedListEditor<TeamMember>
                items={data.team || []}
                onListChange={(newList) => onUpdate('team', newList)}
                getItemTitle={(item, index) => item.name?.en || `Member ${index+1}`}
                onAddItemTemplate={newTeamMemberTemplate}
                entityName="Team Member"
                selectedIndex={selectedIndex}
                onSelectIndex={onSelectIndex}
                renderEditor={(member, index, onRemove) => (
                    <>
                        <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                        {renderLocalizedTextField('Name', `team.${index}.name`, member.name)}
                        {renderLocalizedTextField('Role', `team.${index}.role`, member.role)}
                        {renderLocalizedTextField('Bio', `team.${index}.bio`, member.bio, true)}
                        {renderImageField('Image URL', `team.${index}.imageUrl`, member.imageUrl)}
                        {renderTextField('Image Alt Text', `team.${index}.imageAlt`, member.imageAlt)}
                    </>
                )}
            />
        </AdminSection>
    </>
};

const BlogTab = React.memo(({data, handlers, onUpdate, selectedIndex, onSelectIndex}: {data: PageContent, handlers: any, onUpdate: (path: string, value: any) => void, selectedIndex: number, onSelectIndex: (index: number) => void}) => {
    const { t, renderLocalizedTextField, renderImageField, renderTextField } = handlers;
    const newPostTemplate: Omit<BlogPost, 'id'> = { slug: '', title: { en: '', es: '' }, author: '', date: new Date().toISOString().split('T')[0], summary: { en: '', es: '' }, content: { en: '', es: '' }, imageUrl: '', imageAlt: '' };
    
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabBlog')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'blogPage.banner.title', data.blogPage?.banner?.title)}
            {renderImageField('Image URL', 'blogPage.banner.imageUrl', data.blogPage?.banner?.imageUrl)}
            {renderLocalizedTextField('Featured Post Title', 'blogPage.featuredPostTitle', data.blogPage?.featuredPostTitle)}
            {renderLocalizedTextField('Recent Posts Title', 'blogPage.recentPostsTitle', data.blogPage?.recentPostsTitle)}
            {renderLocalizedTextField('Share Post Title', 'blogPage.sharePostTitle', data.blogPage?.sharePostTitle)}
        </AdminSection>
        <AdminSection titleKey="tabBlog">
            <TabbedListEditor<BlogPost>
                items={data.blog || []}
                onListChange={(newList) => onUpdate('blog', newList)}
                getItemTitle={(item, index) => item.title?.en || `Post ${index+1}`}
                onAddItemTemplate={newPostTemplate}
                entityName="Blog Post"
                reorderable={false}
                selectedIndex={selectedIndex}
                onSelectIndex={onSelectIndex}
                renderEditor={(post, index, onRemove) => (
                     <>
                         <button onClick={onRemove} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded"> Remove </button>
                         {renderTextField('Slug', `blog.${index}.slug`, post.slug)}
                         {renderLocalizedTextField('Title', `blog.${index}.title`, post.title)}
                         {renderTextField('Author', `blog.${index}.author`, post.author)}
                         {renderTextField('Date', `blog.${index}.date`, post.date, false, 'date')}
                         {renderLocalizedTextField('Summary', `blog.${index}.summary`, post.summary, true)}
                         {renderLocalizedTextField('Content', `blog.${index}.content`, post.content, true)}
                         {renderImageField('Image URL', `blog.${index}.imageUrl`, post.imageUrl)}
                         {renderTextField('Image Alt Text', `blog.${index}.imageAlt`, post.imageAlt)}
                     </>
                )}
            />
        </AdminSection>
    </>
});

const ContactTab = React.memo(({data, handlers}: {data: PageContent['contactPage'], handlers: any}) => {
    const { t, renderLocalizedTextField, renderImageField } = handlers;
    return <>
         <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabContact')}</h2>
         <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'contactPage.banner.title', data.banner?.title)}
            {renderImageField('Image URL', 'contactPage.banner.imageUrl', data.banner?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionIntro">
             {renderLocalizedTextField('Text', 'contactPage.intro', data.intro, true)}
        </AdminSection>
        <AdminSection titleKey="sectionForm">
            {renderLocalizedTextField('Address Title', 'contactPage.addressTitle', data.addressTitle)}
            {renderLocalizedTextField('Phone Title', 'contactPage.phoneTitle', data.phoneTitle)}
            {renderLocalizedTextField('Email Title', 'contactPage.emailTitle', data.emailTitle)}
            {renderLocalizedTextField('Form Title', 'contactPage.form.title', data.form?.title)}
            {renderLocalizedTextField('Name Label', 'contactPage.form.nameLabel', data.form?.nameLabel)}
            {renderLocalizedTextField('Email Label', 'contactPage.form.emailLabel', data.form?.emailLabel)}
            {renderLocalizedTextField('Message Label', 'contactPage.form.messageLabel', data.form?.messageLabel)}
            {renderLocalizedTextField('Button Text', 'contactPage.form.buttonText', data.form?.buttonText)}
        </AdminSection>
    </>
});

const DonateTab = React.memo(({data, handlers}: {data: PageContent['donatePage'], handlers: any}) => {
    const { t, renderLocalizedTextField, renderImageField } = handlers;
    return <>
        <h2 className="text-2xl font-semibold text-brand-green-dark mb-4">{t('tabDonate')}</h2>
        <AdminSection titleKey="sectionBanner">
            {renderLocalizedTextField('Title', 'donatePage.banner.title', data.banner?.title)}
            {renderImageField('Image URL', 'donatePage.banner.imageUrl', data.banner?.imageUrl)}
        </AdminSection>
        <AdminSection titleKey="sectionIntro">
             {renderLocalizedTextField('Text', 'donatePage.intro', data.intro, true)}
        </AdminSection>
        <AdminSection titleKey="sectionForm">
            {renderLocalizedTextField('Choose Amount', 'donatePage.form.chooseAmount', data.form?.chooseAmount)}
            {renderLocalizedTextField('Custom Amount', 'donatePage.form.customAmount', data.form?.customAmount)}
            {renderLocalizedTextField('First Name', 'donatePage.form.firstName', data.form?.firstName)}
            {renderLocalizedTextField('Last Name', 'donatePage.form.lastName', data.form?.lastName)}
            {renderLocalizedTextField('Email Address', 'donatePage.form.emailAddress', data.form?.emailAddress)}
            {renderLocalizedTextField('Payment Placeholder', 'donatePage.form.paymentPlaceholder', data.form?.paymentPlaceholder)}
            {renderLocalizedTextField('Donate Button Text (use {{amount}})', 'donatePage.form.donateAmount', data.form?.donateAmount)}
        </AdminSection>
        <AdminSection titleKey="sectionThankYou">
            {renderLocalizedTextField('Thank You Title', 'donatePage.thankYou.title', data.thankYou?.title)}
            {renderLocalizedTextField('Thank You Text (use {{amount}})', 'donatePage.thankYou.text', data.thankYou?.text)}
        </AdminSection>
    </>
});

export default AdminPage;
