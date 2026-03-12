# Encriptación de Credenciales con git-crypt

Este repositorio usa **git-crypt** para encriptar archivos sensibles como credenciales.

## Archivos Encriptados

- `_workers/credentials.json` - Credenciales de MercadoLibre, Cloudflare KV, Google Sheets

## Setup Inicial (solo una vez)

### 1. Instalar git-crypt

```bash
# macOS
brew install git-crypt

# Linux
sudo apt-get install git-crypt
```

### 2. Inicializar git-crypt en el repo

```bash
cd /Users/ldasso/Work/personal/me
git-crypt init
```

### 3. Exportar la key (backup)

```bash
# Exportar key a un lugar seguro (NO commitear esto)
git-crypt export-key ~/Dropbox/git-crypt-keys/personal-me.key
```

**⚠️ Importante:** Guarda esta key en un lugar seguro (Dropbox, 1Password, etc.). Sin ella no podrás desencriptar los archivos en otro equipo.

## Uso Diario

### Encriptar archivos

```bash
# Agregar archivo al repo
git add _workers/credentials.json

# Al hacer commit, git-crypt lo encripta automáticamente
git commit -m "Add credentials"
git push
```

Los archivos se encriptan automáticamente al hacer `git push`.

### Desencriptar archivos (en otro equipo)

```bash
cd /Users/ldasso/Work/personal/me

# Opción 1: Usar la key exportada
git-crypt unlock ~/Dropbox/git-crypt-keys/personal-me.key

# Opción 2: Usar GPG (si configuraste GPG keys)
git-crypt unlock
```

### Ver estado de encriptación

```bash
# Ver qué archivos están encriptados
git-crypt status

# Ver si el repo está desbloqueado
git-crypt status -e
```

## Verificar que Funciona

1. **Hacer commit y push**
   ```bash
   git add _workers/credentials.json .gitattributes
   git commit -m "Add encrypted credentials"
   git push
   ```

2. **Ver en GitHub** - El archivo `credentials.json` debería verse como basura encriptada

3. **En tu máquina local** - El archivo se ve en claro (porque git-crypt está unlock)

## Troubleshooting

### El archivo no se encripta

Verifica que `.gitattributes` tiene la configuración correcta:
```bash
cat .gitattributes
# Debe contener: _workers/credentials.json filter=git-crypt diff=git-crypt
```

### Perdí la key

Si perdiste la key y el repo está unlock en tu máquina:
```bash
# Exportar key antes de que sea tarde
git-crypt export-key ~/backup-nueva-key.key
```

## Referencias

- Documentación: https://github.com/AGWA/git-crypt
- Tutorial: https://dev.to/heroku/how-to-manage-your-secrets-with-git-crypt-56ih
