import secrets

def generate_keys():
    secret_key = secrets.token_hex(32)
    jwt_key = secrets.token_hex(32)
    
    print("Copy these keys to your .env file:")
    print("="*50)
    print(f"SECRET_KEY={secret_key}")
    print(f"JWT_SECRET_KEY={jwt_key}")
    print("="*50)

if __name__ == "__main__":
    generate_keys()