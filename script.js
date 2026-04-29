const { useState } = React;

// Твои данные из Supabase
const SUPABASE_URL = 'https://kbawfxxnydhczyblwagm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6lMskE4Ar4WAZvwLMj-dlg_M2Z5KM3P';
const supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_KEY);

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('reg');

    const handleReg = async (e) => {
        e.preventDefault();
        setLoading(true);
        const name = e.target.name.value;
        const pin = e.target.pin.value;
        const pCode = Math.floor(100 + Math.random() * 899).toString();

        const { data, error } = await supabase.from('users').insert([{
            name, pin, personalCode: pCode, phone: "+79" + Math.floor(100000000 + Math.random() * 900000000),
            balance: 15000, card: "2200 1902 " + Math.floor(1000 + Math.random() * 8999), history: []
        }]).select();

        if (error) alert("Ошибка базы: " + error.message);
        else {
            alert("ТВОЙ КОД ДЛЯ ВХОДА: " + pCode);
            setUser(data[0]);
        }
        setLoading(false);
    };

    if (loading) return <div className="p-10 text-yellow-400">Загрузка...</div>;

    if (!user) {
        return (
            <div className="p-10 flex flex-col gap-6 max-w-md mx-auto">
                <h1 className="text-yellow-400 text-3xl font-black italic">T-BANK</h1>
                <form onSubmit={handleReg} className="flex flex-col gap-4">
                    <input name="name" required placeholder="Имя Фамилия" className="bg-zinc-900 p-5 rounded-2xl border border-white/5 text-white" />
                    <input name="pin" type="password" required placeholder="ПИН-код" className="bg-zinc-900 p-5 rounded-2xl border border-white/5 text-white text-center" maxLength="4" />
                    <button className="bg-yellow-400 text-black font-bold py-5 rounded-2xl shadow-lg uppercase">Создать счет</button>
                </form>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <div className="bg-zinc-900 p-8 rounded-[32px] border border-white/10 shadow-2xl">
                <p className="text-zinc-500 text-xs uppercase mb-2">Баланс</p>
                <h2 className="text-4xl font-bold">{user.balance.toLocaleString()} ₽</h2>
                <p className="mt-6 text-zinc-500 font-mono">{user.card}</p>
                <p className="text-sm mt-2">{user.name}</p>
            </div>
            <button onClick={() => window.location.reload()} className="mt-10 text-zinc-600 underline text-sm">Выйти</button>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

