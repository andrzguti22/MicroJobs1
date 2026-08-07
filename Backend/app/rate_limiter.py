from slowapi import Limiter
from slowapi.util import get_remote_address

# Limitador basado en la IP de origen. Usa almacenamiento en memoria por
# defecto (suficiente para una sola instancia del backend). Si en el futuro
# se despliega con varias instancias/workers, cambiar a un backend
# compartido como Redis (storage_uri="redis://...").
limiter = Limiter(key_func=get_remote_address)