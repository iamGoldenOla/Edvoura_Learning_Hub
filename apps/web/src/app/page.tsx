export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-edvoura-navy text-white text-center p-8">
      <h1 className="text-5xl font-bold text-edvoura-gold mb-6">EDVOURA</h1>
      <p className="text-xl max-w-2xl text-slate-300 mb-10">
        The ultimate learning hub. Connect students, parents, and elite tutors in one unified ecosystem.
      </p>
      
      <div className="flex space-x-4 mt-6">
        <a 
          href="/login" 
          className="bg-edvoura-gold text-edvoura-navy-dark px-8 py-3 rounded-md font-bold hover:bg-edvoura-gold-light transition-colors"
        >
          Login
        </a>
        <a 
          href="/signup" 
          className="border border-slate-400 text-white px-8 py-3 rounded-md font-bold hover:bg-slate-800 transition-colors"
        >
          Create Account
        </a>
      </div>
    </div>
  );
}
