import ContactForm from '@/app/contact/ContactForm';
import ContactNavbar from '@/components/ContactNavbar';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ContactNavbar />
      
      <main className="container mx-auto px-4 pt-32 pb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Entre em Contato</h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Estamos prontos para atender você. Preencha o formulário abaixo e entraremos em contato o mais breve possível.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 