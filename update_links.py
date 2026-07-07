import os, re
for root, _, files in os.walk('src/pages/order'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update Link imports
            if '<Link' in content and 'useParams' not in content:
                content = content.replace("import { Link } from 'react-router-dom';", "import { Link, useParams } from 'react-router-dom';")
                content = content.replace("import { Link, useNavigate }", "import { Link, useNavigate, useParams }")
                
            # Update useNavigate imports
            if ('navigate(' in content) and 'useParams' not in content:
                content = content.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useParams } from 'react-router-dom';")
                content = content.replace("import { useLocation, useNavigate } from 'react-router-dom';", "import { useLocation, useNavigate, useParams } from 'react-router-dom';")
                content = content.replace("import { useNavigate, useLocation } from 'react-router-dom';", "import { useNavigate, useLocation, useParams } from 'react-router-dom';")

            # Inject token
            if ('<Link' in content or 'navigate(' in content) and 'useParams<{ token: string }>()' not in content:
                content = re.sub(r'(export default function \w+\([^)]*\)\s*\{)', r'\1\n  const { token } = useParams<{ token: string }>();', content)
                
            # Replace to=\"/path\"
            def repl_link(m):
                p = m.group(1)
                if p == '/': return 'to={`/order/${token}`}'
                return f'to={{`/order/${{token}}{p}`}}'
            content = re.sub(r'to=\"(/[^\"]*)\"', repl_link, content)
            
            # Replace navigate('/path')
            def repl_nav(m):
                p = m.group(1)
                if p == '/': return 'navigate(`/order/${token}`)'
                return f'navigate(`/order/${{token}}{p}`)'
            content = re.sub(r'navigate\([\'\"](/[^\"\']+)[\'\"]\)', repl_nav, content)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
print('Done!')
