-- Criação de tipos ENUM para padronização
CREATE TYPE status_equipamento AS ENUM ('disponivel', 'em_cautela', 'manutencao');
CREATE TYPE status_cautela AS ENUM ('ativa', 'devolvida');
CREATE TYPE status_manutencao AS ENUM ('aberta', 'concluida');
CREATE TYPE tipo_manutencao AS ENUM ('preventiva', 'corretiva');

-- Tabela de Equipamentos
CREATE TABLE equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    numero_serie VARCHAR(100) UNIQUE,
    categoria VARCHAR(100) NOT NULL,
    status status_equipamento DEFAULT 'disponivel',
    data_proxima_calibracao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Cautelas (Empréstimos/Retiradas)
CREATE TABLE cautelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipamento_id UUID REFERENCES equipamentos(id) ON DELETE CASCADE,
    funcionario_responsavel VARCHAR(255) NOT NULL,
    data_retirada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    data_devolucao_prevista TIMESTAMP WITH TIME ZONE,
    status status_cautela DEFAULT 'ativa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela de Manutenções
CREATE TABLE manutencoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipamento_id UUID REFERENCES equipamentos(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    tipo tipo_manutencao NOT NULL,
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status status_manutencao DEFAULT 'aberta',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Triggers para atualização da coluna updated_at automaticamente (Opcional, mas recomendado)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipamentos_modtime BEFORE UPDATE ON equipamentos FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_cautelas_modtime BEFORE UPDATE ON cautelas FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_manutencoes_modtime BEFORE UPDATE ON manutencoes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
