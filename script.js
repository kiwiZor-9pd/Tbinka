const { useState, useEffect } = React;

const SUPABASE_URL = 'https://kbawfxxnydhczyblwagm.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_6lMskE4Ar4WAZvwLMj-dlg_M2Z5KM3P';
const supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_KEY);

const Icon = ({ name, size = 24, className = "" }) => {
    useEffect(() => { if (window.lucide) lucide.createIcons(); }, []);
    return <i data-lucide={name} style={{width: size, height: size}} className={className}></i>;
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('reg');
    const [tab, setTab] = useState('main');

    const refreshUserData = async (id) => {
        const { data } = await supabase.from('users').select('*').eq('id', id).single();
        if (data) setUser(data);
    };

    const handleReg = async (e) => {
        e.preventDefault();
        setLoading(true);
        const name = e.target.name.value;
        const pin = e.target.pin.value;
        const pCode = Math.floor(100 + Math.random() * 899).toString();
        const phone = "+7 9" + Math.floor(100000000 + Math.random() * 900000000);

        const { data, error } = await supabase.from('users').insert([{
            name, pin, personalCode: pCode, phone, balance: 15000, 
            card: "2200 1902 " + Math.floor(1000 + Math.random() * 8999),
            history: []
        }]).select();

        if (error) alert("Ошибка! Проверь таблицу 'users' в Supabase");
        else {
            alert("УСПЕХ! Твой личный код: " + pCode);
            setUser(data[0]);
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { data } = await supabase.from('users')
            .select('*').eq('pin', e.target.pin.value).eq('personalCode', e.target.pCode.value).single();
        if (data) setUser(data);
        else alert("Неверный ПИН или Код!");
        setLoading(false);
    };

    const processTransfer = async (e) => {
        e.preventDefault();
        const targetPhone = e.target.target.value.trim();
        const amount = Number(e.target.amount.value);
        if (amount <= 0 || amount > user.balance) return alert("Недостаточно средств!");

        setLoading(true);
        const { data: recipient } = await supabase.from('users').select('*').eq('phone', targetPhone).single();

        if (!recipient) {
            setLoading(false);
            return alert("Получатель не найден!");
        }

        const now = new Date().toLocaleDateString('ru-RU');

        // Минус у тебя
        await supabase.from('users').update({ 
            balance: user.balance - amount, 
            history: [{title: `Перевод: ${recipient.name}`, amt: -amount, type: 'minus', date: now}, ...(user.history || [])]
        }).eq('id', user.id);

        // Плюс у него
        await supabase.from('users').update({ 
            balance: recipient.balance + amount, 
            history: [{title: `От: ${user.name}`, amt: amount, type: 'plus', date: now}, ...(recipient.history || [])]
        }).eq('id', recipient.id);

        alert("ПЕРЕВОД УСПЕШЕН!");
        await refreshUserData(user.id);
        setTab('main');
        setLoading(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-black text-yellow-400 italic animate-pulse">Проверка транзакции...</div>;

    if (!user) {
        return (
            <div className="flex flex-col h-screen p-8 justify-center items-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-yellow-400 rounded-3xl mb-6 flex items-center justify-center t-yellow-shadow">
                    <Icon name="shield-check" className="text-black" size={40} />
                </div>
                <h1 className="text-3xl font-black italic text-yellow-400 mb-10 tracking-tighter">T-BANK PRIVATE</h1>
                
                {mode === 'reg' ? (
                    <form onSubmit={handleReg} className="w-full space-y-4">
                        <input name="name" required placeholder="Имя Фамилия" className="w-full bg-zinc-900/50 p-5 rounded-2xl outline-none border border-white/5" />
                        <input name="pin" type="password" required placeholder="ПИН" className="w-full bg-zinc-900/50 p-5 rounded-2xl outline-none text-center tracking-widest border border-white/5" />
                        <button className="w-full bg-yellow-400 text-black font-bold py-5 rounded-2xl t-yellow-shadow uppercase">Открыть счет</button>
                        <button type="button" onClick={() => setMode('login')} className="w-full text-zinc-500 text-sm mt-4">Уже есть аккаунт? Войти</button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="w-full space-y-4">
                        <input name="pin" type="password" required placeholder="ПИН" className="w-full bg-zinc-900/50 p-5 rounded-2xl outline-none text-center tracking-widest border border-white/5" />
                        <input name="pCode" type="password" required placeholder="Личный код" className="w-full bg-zinc-900/50 p-5 rounded-2xl outline-none text-center border border-white/5" />
                        <button className="w-full bg-yellow-400 text-black font-bold py-5 rounded-2xl t-yellow-shadow uppercase">Войти в банк</button>
                        <button type="button" onClick={() => setMode('reg')} className="w-full text-zinc-500 text-sm mt-4">Создать новый счет</button>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto flex flex-col h-screen">
            <header className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black text-xl italic">{user.name[0]}</div>
                    <p className="font-bold text-sm">{user.name}</p>
                </div>
                <button onClick={() => window.location.reload()}><Icon name="log-out" className="text-zinc-600" /></button>
            </header>

            <main className="flex-1 px-6 overflow-y-auto pb-20">
                {tab === 'main' ? (
                    <div className="space-y-8">
                        <div className="t-card-gradient p-8 rounded-[40px] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Ваш баланс</p>
                            <h2 className="text-4xl font-black italic mb-10 tracking-tight text-white">{user.balance.toLocaleString()} ₽</h2>
                            <p className="font-mono text-zinc-600 text-xs tracking-widest uppercase">{user.card}</p>
                        </div>

                        <button onClick={() => setTab('transfer')} className="w-full bg-yellow-400 text-black py-6 rounded-[2rem] flex items-center justify-center gap-4 font-black italic t-yellow-shadow">
                            <Icon name="send" /> ПЕРЕВЕСТИ ДЕНЬГИ
                        </button>

                        <div className="space-y-4">
                            <h3 className="font-bold italic text-zinc-500 text-sm px-2">ИСТОРИЯ ОПЕРАЦИЙ</h3>
                            {(!user.history || user.history.length === 0) ? (
                                <div className="text-center py-10 opacity-20 italic">Пока нет движений по счету</div>
                            ) : user.history.map((h, i) => (
                                <div key={i} className="bg-zinc-900/30 p-5 rounded-3xl flex justify-between items-center border border-white/[0.03]">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${h.type === 'plus' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-zinc-400'}`}>
                                            <Icon name={h.type === 'plus' ? 'trending-up' : 'trending-down'} size={18}/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{h.title}</p>
                                            <p className="text-[10px] text-zinc-600">{h.date}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${h.type === 'plus' ? 'text-green-500' : 'text-white'}`}>
                                        {h.amt > 0 ? '+' : ''}{h.amt.toLocaleString()} ₽
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-black italic text-yellow-400">МГНОВЕННЫЙ ПЕРЕВОД</h2>
                        <form onSubmit={processTransfer} className="space-y-10">
                            <div className="space-y-2">
                                <p className="text-xs text-zinc-600 font-bold px-2 uppercase tracking-widest">Номер телефона</p>
                                <input name="target" required placeholder="+7 999 000-00-00" className="w-full bg-zinc-900 p-5 rounded-2xl outline-none border border-white/5 text-xl" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-zinc-600 font-bold mb-4 uppercase tracking-widest">Сумма перевода</p>
                                <input name="amount" type="number" required placeholder="0 ₽" className="w-full bg-transparent text-6xl font-black text-center outline-none text-yellow-400 placeholder-yellow-400/20" />
                            </div>
                            <div className="space-y-4">
                                <button className="w-full bg-yellow-400 text-black py-6 rounded-[2rem] font-black t-yellow-shadow text-lg uppercase">Оправить сейчас</button>
                                <button type="button" onClick={() => setTab('main')} className="w-full text-zinc-500 font-bold py-2">ОТМЕНА</button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
