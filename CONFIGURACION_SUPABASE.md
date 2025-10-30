# 🔧 Configuración de Supabase para Oeste Pan Platform

Este documento explica cómo configurar correctamente Supabase para solucionar los problemas de autenticación.

---

## 🔍 Problemas Conocidos y Sus Soluciones

### Problema 1: "No user or session returned after sign up"
**Causa:** La confirmación de email está habilitada en Supabase, pero no tienes un proveedor de email configurado.

**Solución:** Deshabilitar la confirmación de email (recomendado para desarrollo).

### Problema 2: Necesidad de refrescar la página después del login
**Causa:** Falta de sincronización entre el cliente y el middleware de Next.js.

**Solución:** Implementada en el código con redirección forzada después del login.

### Problema 3: No llegan emails de confirmación
**Causa:** No hay proveedor de email configurado en Supabase.

**Solución:** Configurar un proveedor de email o deshabilitar la confirmación.

---

## 📧 Opción 1: Deshabilitar Confirmación de Email (Recomendado para Desarrollo)

### Pasos en Supabase Dashboard:

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. En el menú lateral, ve a **Authentication** → **Settings**
3. Busca la sección **"Email Auth"**
4. Desactiva la opción **"Enable email confirmations"**
5. Guarda los cambios

### ¿Qué hace esto?
- Los usuarios se registran y pueden iniciar sesión inmediatamente
- No se requiere verificación de email
- Perfecto para desarrollo y testing

### Captura de pantalla de referencia:
```
Authentication > Settings > Email Auth
┌─────────────────────────────────────────┐
│ Enable email confirmations       [OFF]  │
│ (Los usuarios no necesitan confirmar    │
│  su email para iniciar sesión)          │
└─────────────────────────────────────────┘
```

---

## 📧 Opción 2: Configurar Proveedor de Email (Recomendado para Producción)

Si necesitas confirmación de email (recomendado para producción), necesitas configurar un proveedor de email.

### Opción 2A: Usar el proveedor por defecto de Supabase (Límites diarios)

**IMPORTANTE:** Supabase tiene límites en su servicio de email gratuito:
- **Máximo 3 emails por hora**
- **Máximo 4 usuarios nuevos por hora**

Para habilitar emails:
1. Ve a **Authentication** → **Settings** → **Email Auth**
2. Activa **"Enable email confirmations"**
3. Los emails se enviarán desde `noreply@mail.app.supabase.io`

### Opción 2B: Configurar un Proveedor de Email Personalizado

Puedes usar servicios como:
- **SendGrid**
- **Mailgun**
- **Amazon SES**
- **Resend**

#### Pasos para configurar proveedor personalizado:

1. Ve a **Project Settings** → **Auth** → **SMTP Settings**
2. Habilita **"Enable Custom SMTP"**
3. Configura los datos de tu proveedor:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP Username: apikey
   SMTP Password: TU_API_KEY_DE_SENDGRID
   Sender Email: noreply@tudominio.com
   Sender Name: Oeste Pan
   ```
4. Guarda los cambios

#### Ejemplo con SendGrid (Gratis hasta 100 emails/día):

1. Crea una cuenta en [sendgrid.com](https://sendgrid.com)
2. Verifica tu dominio o email
3. Crea una API Key en Settings → API Keys
4. Usa esa API Key como password en Supabase
5. Configura los datos SMTP como se muestra arriba

---

## 🔄 Configuración de URLs de Redirect

### Configurar las URLs de callback:

1. Ve a **Authentication** → **URL Configuration**
2. Agrega las siguientes URLs a **"Redirect URLs"**:

   **Para Desarrollo:**
   ```
   http://localhost:3004/auth/callback
   ```

   **Para Producción:**
   ```
   https://tudominio.com/auth/callback
   ```

### ¿Por qué es importante?
- Supabase enviará al usuario a esta URL después de confirmar su email
- Nuestra aplicación procesará la confirmación y creará la sesión

---

## ⚙️ Configuración de Templates de Email (Opcional)

Si quieres personalizar los emails que envía Supabase:

1. Ve a **Authentication** → **Email Templates**
2. Personaliza los templates disponibles:
   - **Confirm signup** - Email de confirmación de registro
   - **Magic Link** - Email con enlace mágico de login
   - **Change Email Address** - Confirmación de cambio de email
   - **Reset Password** - Email de recuperación de contraseña

### Variables disponibles en los templates:
- `{{ .SiteURL }}` - URL de tu sitio
- `{{ .Token }}` - Token de confirmación
- `{{ .TokenHash }}` - Hash del token
- `{{ .ConfirmationURL }}` - URL completa de confirmación

---

## 🧪 Verificar la Configuración

### Test de Registro sin Confirmación de Email:

1. Ve a tu app: `http://localhost:3004/register`
2. Completa el formulario de registro
3. **Esperado:** Deberías ser redirigido al dashboard inmediatamente
4. **Si falla:** Verifica que "Enable email confirmations" esté desactivado

### Test de Registro con Confirmación de Email:

1. Asegúrate de tener configurado un proveedor de email
2. Ve a tu app: `http://localhost:3004/register`
3. Completa el formulario de registro
4. **Esperado:** Verás el mensaje "¡Cuenta creada! Por favor revisa tu email..."
5. Revisa tu email y haz clic en el enlace de confirmación
6. **Esperado:** Serás redirigido al dashboard

### Test de Login:

1. Ve a tu app: `http://localhost:3004/login`
2. Ingresa tus credenciales
3. **Esperado:** Deberías ser redirigido al dashboard automáticamente
4. **No debe requerir refresh de la página**

---

## 🚨 Solución de Problemas Comunes

### Error: "Invalid login credentials"
**Causa:** Email o contraseña incorrectos, o el usuario no está confirmado.

**Solución:**
- Verifica las credenciales
- Si está habilitada la confirmación de email, verifica que el usuario haya confirmado su cuenta
- En Supabase Dashboard → Authentication → Users, verifica el estado del usuario

### Error: "Email rate limit exceeded"
**Causa:** Has alcanzado el límite de emails de Supabase (3 por hora).

**Solución:**
- Espera una hora
- O configura un proveedor de email personalizado
- O deshabilita la confirmación de email

### Error: "User already registered"
**Causa:** Ya existe un usuario con ese email.

**Solución:**
- Usa un email diferente
- O elimina el usuario existente desde Supabase Dashboard → Authentication → Users

### Los usuarios pueden registrarse pero no hacer login
**Causa:** El usuario está esperando confirmación de email.

**Solución:**
- Verifica en Supabase Dashboard → Authentication → Users
- Si el usuario tiene "Email Confirmed: No", puedes:
  - Confirmarlo manualmente desde el dashboard
  - O pedirle que revise su email
  - O deshabilitar la confirmación de email

---

## 📝 Variables de Entorno Necesarias

Asegúrate de tener estas variables en tu `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

---

## ✅ Checklist de Configuración

Para desarrollo (más simple):
- [ ] Deshabilitar "Enable email confirmations" en Supabase
- [ ] Agregar `http://localhost:3004/auth/callback` a Redirect URLs
- [ ] Verificar que las variables de entorno estén configuradas
- [ ] Probar registro de nuevo usuario
- [ ] Probar login de usuario existente

Para producción (más seguro):
- [ ] Configurar proveedor de email (SendGrid, etc.)
- [ ] Habilitar "Enable email confirmations" en Supabase
- [ ] Agregar URLs de producción a Redirect URLs
- [ ] Personalizar templates de email (opcional)
- [ ] Configurar dominio personalizado para emails (opcional)
- [ ] Probar flujo completo de registro con confirmación
- [ ] Probar flujo de recuperación de contraseña

---

## 🔗 Enlaces Útiles

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Configuración de SMTP en Supabase](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Templates en Supabase](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SendGrid (Proveedor de email gratuito)](https://sendgrid.com)
- [Resend (Alternativa moderna)](https://resend.com)

---

## 💡 Recomendaciones

### Para Desarrollo:
1. **Deshabilita la confirmación de email** - Es más rápido y simple
2. Usa emails de prueba (ejemplo: test1@test.com, test2@test.com)
3. Si necesitas probar confirmación de email, verifica manualmente desde el dashboard

### Para Producción:
1. **Habilita la confirmación de email** - Es más seguro
2. **Configura un proveedor de email confiable** - SendGrid o Resend son buenas opciones
3. Personaliza los templates de email con tu branding
4. Configura un dominio personalizado para los emails
5. Monitorea los límites y uso de tu proveedor de email

---

## 🆘 Soporte

Si sigues teniendo problemas después de seguir esta guía:

1. Verifica los logs en el navegador (F12 → Console)
2. Verifica los logs en Supabase Dashboard → Logs → Auth Logs
3. Revisa los detalles del usuario en Authentication → Users
4. Consulta la documentación oficial de Supabase

---

**Última actualización:** 30 de Octubre, 2025
**Versión de la plataforma:** 1.0.0

