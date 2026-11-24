export function Buscador({ valor }: { valor?: string }) {
  return (
    <div className="buscador">
      <h2>¿Salió tu número?</h2>
      <p>Escribe 2, 3 o 4 cifras y te mostramos en qué chance o lotería salió en los últimos 90 días.</p>
      <form action="/buscar" method="get" role="search">
        <label htmlFor="n" className="oculto">
          Número
        </label>
        <input
          id="n"
          name="n"
          inputMode="numeric"
          pattern="[0-9]{2,4}"
          maxLength={4}
          autoComplete="off"
          placeholder="0000"
          defaultValue={valor}
          required
        />
        <button className="boton" type="submit">
          Buscar
        </button>
      </form>
    </div>
  );
}
