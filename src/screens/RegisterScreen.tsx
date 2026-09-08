import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BrandMark } from '@/components/ui/BrandMark';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Container, Heading, Body, Input, Caption } from '@/src/components';

export function RegisterScreen() {
  const { user, loading, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <LoadingState message="Verificando sessão..." />;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  async function handleRegister() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Preencha nome, e-mail e senha com pelo menos 6 caracteres.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await signUp({ name, email, password });
      router.replace('/(app)');
    } catch {
      setError('Não foi possível criar a conta. Tente outro e-mail.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoLogin() {
    router.push('/(auth)/login');
  }

  return (
    <Container scroll keyboard>
      <View className="mb-8 mt-4">
        <BrandMark size="sm" showName />
      </View>

      <View className="mb-8 gap-2">
        <Heading>Criar conta</Heading>
        <Body>Cadastro aberto. Você começa no plano Free, com acesso às funções principais.</Body>
      </View>

      <View className="gap-4">
        <Input
          label="Nome"
          leftIcon="person-outline"
          autoComplete="name"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
        />
        <Input
          label="E-mail"
          leftIcon="mail-outline"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
        />
        <Input
          label="Senha"
          leftIcon="lock-closed-outline"
          isPassword
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
        />

        <Caption>
          O Premium remove anúncios quando a publicidade estiver ativa. As telas do app são as mesmas
          nos dois planos.
        </Caption>

        {error ? <Caption className="text-signal">{error}</Caption> : null}

        <Button
          label="Criar conta"
          onPress={handleRegister}
          loading={submitting}
          className="mt-2"
        />
        <Button label="Já tenho conta" variant="secondary" onPress={handleGoLogin} />
      </View>
    </Container>
  );
}
