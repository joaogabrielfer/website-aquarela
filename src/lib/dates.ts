const months = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];
export const formatCivilDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return `${day} de ${months[(month ?? 1) - 1]} de ${year}`;
};
