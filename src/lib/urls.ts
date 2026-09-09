export const telUrl = (phone: string) => `tel:${phone}`;
export const whatsappUrl = (phone: string, interest?: string) =>
  `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(interest ? `Olá! Gostaria de conhecer o Aquarela e saber mais sobre ${interest}.` : 'Olá! Gostaria de combinar uma visita ao Aquarela.')}`;
export const formatPhone = (phone: string) => {
  const d = phone.replace(/^\+55/, '').replace(/\D/g, '');
  return d.length === 11
    ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : phone;
};
