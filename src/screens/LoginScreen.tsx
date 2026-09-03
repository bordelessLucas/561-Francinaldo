import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { BrandMark } from '@/components/ui/BrandMark';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Container, Heading, Body, Input, Caption } from '@/src/components';

function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code)
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um momento e tente de novo.';
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique sua conexão.';
    default:
      return 'Não foi possível entrar. Verifique e-mail e senha.';
  }
}

export function LoginScreen() {
  const { user, loading, signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (loading) {
    return <LoadingState message="Verificando sessão..." />;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  async function handleLogin() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/(app)');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Informe seu e-mail para recuperar a senha.');
      return;
    }
    setResetting(true);
    try {
      await resetPassword(email);
      setInfo('Enviamos um e-mail com instruções para redefinir sua senha.');
    } catch {
      setError('Não foi possível enviar a recuperação de senha.');
    } finally {
      setResetting(false);
    }
  }

  function handleCreateAccount() {
    router.push('/(auth)/register');
  }

  return (
    <Container scroll keyboard>
      <View className="mb-10 mt-4 items-center">
        <BrandMark size="lg" showTagline onDarkPlate />
      </View>

      <View className="mb-8 gap-2">
        <Heading className="text-3xl">Entrar</Heading>
        <Body>Acesse para analisar ambientes e consultar materiais de SST.</Body>
      </View>

      <View className="gap-4">
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
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />

        {error ? <Caption className="text-signal">{error}</Caption> : null}
        {info ? <Caption className="text-brand-dark">{info}</Caption> : null}

        <Pressable onPress={handleForgotPassword} disabled={resetting} className="self-end py-1">
          <Caption className="font-sansMedium text-brand-dark">
            {resetting ? 'Enviando...' : 'Esqueci minha senha'}
          </Caption>
        </Pressable>

        <Button label="Entrar" onPress={handleLogin} loading={submitting} className="mt-2" />
        <Button label="Criar conta" variant="outline" onPress={handleCreateAccount} />
      </View>
    </Container>
  );
}
