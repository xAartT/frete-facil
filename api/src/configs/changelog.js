export const changelog = [
    // esses sqls vao ser executados cada vez que subir a api, por isso deve ser validado se o que precisa ser adicionado, ja nao esta adicionado (if exists/ if not exists)
    // exemplo:
    // "alter table if exists tabela add column if not exists nova_coluna1 integer",
    // "alter table if exists tabela2 drop column if exists coluna2",
];