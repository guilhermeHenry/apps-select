# Select
Select input customizavel com aparência 
+ resize (Redimencinamento automático com barra de rolagem automática)

## Estrutura

1. **option**
	+  [value] valor para armazenamento 
	+  [ContentText] Exibição para o usuário
	+  [class="option"] - **Obrigatório**
2. **Separator** - Elemento reponsavel pela linha horizontal que divide elementos
3. **Option Group**
	[class="optgroup"] Obrigatória
	[ContentText] Nome do grupo
4. **output** - Exibição da opção selecionada para o usuário
5. **select**
   + [id] - Relaciona-se com o name do input

## Estrutura
``` html
<div class="select" id="state1">
	<div class="output">Escholha seu estado</div>
	<div class="options" id="1">
		<div value="AC" class="option">Acre</div>
		<div value="AL" class="option">Alagoas</div>
		<div value="AP" class="option">Amapá</div>
		<div value="AM" class="option">Amazonas</div>
		<small class="optgroup">Surdeste</small>
		<div value="BA" class="option">Bahia</div>
		<div value="CE" class="option">Ceará</div>
		<div value="DF" class="option">Distrito Federal</div>
		<div value="ES" class="option">Espírito Santo</div>
		<hr class="separator">
		<div value="GO" class="option">Goiás</div>
		<div value="MA" class="option">Maranhão</div>
		<div value="MT" class="option">Mato Grosso</div>
		<div value="MS" class="option">Mato Grosso do Sul</div>
		<div value="MG" class="option">Minas Gerais</div>
		<div value="PA" class="option">Pará</div>
	</div>
</div>
```

## Imagens
![](overview.png)
# apps-select
