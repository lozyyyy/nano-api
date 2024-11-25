/**
 * Função que retorna informações do usuário com base no ID do Discord.
 * @param {string} userId - ID do usuário no Discord.
 * @returns {Object} - Objeto com informações do usuário, como nome e avatar.
 */
function truncateString(name, maxLength) {
    if (name.length > maxLength) {
        return name.slice(0, maxLength - 3) + '...';
    }
    return name; // Retorna o nome completo se for menor ou igual ao limite.
}

async function getUserInfo(userId) {
  const token = process.env.Btoken; // Token do bot armazenado na variável de ambiente

  try {
    // Realiza a requisição GET à API REST do Discord para obter as informações do usuário
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${token}`
      }
    });

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao obter informações do usuário: ${response.statusText}`);
    }

    const user = await response.json();

    // Retorna as informações relevantes
    return {
      username: truncateString(user.username, 14),
      discriminator: user.discriminator,
      avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
      id: user.id
    };
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    throw new Error('Não foi possível obter informações do usuário.');
  }
}

/**
 * Função que converte números grandes para uma forma abreviada, como 1k, 1M, etc.
 * Aceita números até quintilhões.
 * @param {number} value - Número que será abreviado.
 * @param {number} [decimalPlaces=1] - Número de casas decimais a ser exibido após a abreviação.
 * @returns {string} - Valor abreviado.
 */
function abbreviate(value, decimalPlaces = 1) {
  // Certifique-se de que o valor seja um número
  if (isNaN(value)) {
    throw new Error("O valor fornecido não é um número válido.");
  }

  const abbreviations = [
    { value: 1e18, suffix: 'QQ' },   // Quintilhão
    { value: 1e15, suffix: 'Q' },    // Quatrilhão
    { value: 1e12, suffix: 'T' },    // Trilhão
    { value: 1e9, suffix: 'B' },     // bilhão
    { value: 1e6, suffix: 'M' },     // Milhão 
    { value: 1e3, suffix: 'K' }      // Milhar
  ];

  // Se o número for menor que 1000, retorna o número original
  if (value < 1000) return value.toString();

  // Encontra o sufixo apropriado
  for (let i = 0; i < abbreviations.length; i++) {
    if (value >= abbreviations[i].value) {
      // Use toFixed() apenas se o valor for superior ao limite do sufixo
      const abbreviatedValue = (value / abbreviations[i].value).toFixed(decimalPlaces);
      return `${abbreviatedValue}${abbreviations[i].suffix}`;
    }
  }

  // Se nenhum sufixo foi encontrado, converte o valor diretamente
  return value.toString();
}

module.exports = { getUserInfo, abbreviate };