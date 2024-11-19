/**
 * Função que retorna informações do usuário com base no ID do Discord.
 * @param {string} userId - ID do usuário no Discord.
 * @returns {Object} - Objeto com informações do usuário, como nome e avatar.
 */
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
      avatarurl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
      user
    };
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    throw new Error('Não foi possível obter informações do usuário.');
  }
}

module.exports = { getUserInfo };