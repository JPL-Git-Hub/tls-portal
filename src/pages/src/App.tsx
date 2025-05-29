import ClientIntakeForm from './components/ClientIntakeForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Create Your Client Portal
          </h1>
          <ClientIntakeForm />
        </div>
      </div>
    </div>
  );
}

export default App;
