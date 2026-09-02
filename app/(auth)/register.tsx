import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { RolePicker } from '@/components/ui/RolePicker';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';

export default function RegisterScreen() {
  const { user, loading, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <LoadingState message="Verificando sessão..." />;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Preencha nome, e-mail e senha com pelo menos 6 caracteres.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await signUp({ name, email, password, role });
      router.replace('/(app)');
    } catch {
      setError('Não foi possível criar a conta. Tente outro e-mail.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <View className="mb-8 mt-4">
        <BrandMark size="sm" />
      </View>

      <View className="mb-8 gap-2">
        <Text className="font-display text-3xl text-ink">Criar conta</Text>
        <Text className="font-sans text-base text-ink-muted">
          Crie um acesso para abrir a Home. Em produção, as contas serão provisionadas pela
          administração.
        </Text>
      </View>

      <View className="gap-4">
        <Input
          label="Nome"
          autoComplete="name"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
        />
        <Input
          label="E-mail"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
        />
        <Input
          label="Senha"
          secureTextEntry
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
        />
        <RolePicker value={role} onChange={setRole} />
        {error ? <Text className="font-sans text-sm text-signal">{error}</Text> : null}
        <Button
          label="Criar conta e entrar"
          onPress={handleSubmit}
          loading={submitting}
          className="mt-2"
        />
      </View>

      <View className="mt-8 flex-row items-center justify-center gap-1">
        <Text className="font-sans text-ink-muted">Já tem conta?</Text>
        <Link href="/(auth)/login" className="font-sansSemi text-brand-dark">
          Entrar
        </Link>
      </View>
    </Screen>
  );
}
